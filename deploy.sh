#version 1
set -euo pipefail

# ========================
# Env Vars (EDITAR)
# ========================
DOMAIN_NAME="portalclientes.ciberbrain.net"   # tu dominio
EMAIL="contacto@ciberbrain.net"               # tu email para Certbot
REPO_URL="https://github.com/MatiasEnrique/ciberbrain-portal-clientes.git"
APP_DIR="$HOME/ciberbrain-portal-clientes"
SWAP_SIZE="1G"                                # tamaño de swap
# ========================

# Update package list and upgrade existing packages
sudo apt update && sudo apt upgrade -y

# Add Swap Space (idempotente)
if ! swapon --show | grep -q '^/swapfile'; then
  echo "Adding swap space..."
  sudo fallocate -l "$SWAP_SIZE" /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  # Make swap permanent
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

# Install Docker Engine
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=$(dpkg --print-architecture)] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" -y
sudo apt update
sudo apt install -y docker-ce

# Install Docker Compose v2 (binario)
sudo rm -f /usr/local/bin/docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
if [ ! -f /usr/local/bin/docker-compose ]; then
  echo "Docker Compose download failed. Exiting."
  exit 1
fi
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify Docker Compose installation
docker-compose --version >/dev/null || { echo "Docker Compose installation failed. Exiting."; exit 1; }

# Ensure Docker starts on boot and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Clone or update the Git repository
if [ -d "$APP_DIR/.git" ]; then
  echo "Directory $APP_DIR already exists. Pulling latest changes..."
  git -C "$APP_DIR" pull --rebase
else
  echo "Cloning repository from $REPO_URL..."
  git clone "$REPO_URL" "$APP_DIR"
fi

# Install Nginx
sudo apt install -y nginx

# Clean old Nginx config (if any)
sudo rm -f /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/myapp
sudo rm -f /etc/nginx/sites-enabled/default || true

# Stop Nginx temporarily to allow Certbot to run in standalone mode
sudo systemctl stop nginx || true

# Obtain SSL certificate using Certbot standalone mode
sudo apt install -y certbot
sudo certbot certonly --standalone -d "$DOMAIN_NAME" --non-interactive --agree-tos -m "$EMAIL"

# Ensure SSL files exist or generate them (compat con include de certbot)
if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
  sudo wget -q https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/certbot-nginx/src/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -P /etc/letsencrypt/
fi
if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
  sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

# Create Nginx config with reverse proxy, SSL, rate limiting y streaming
sudo bash -c "cat > /etc/nginx/sites-available/myapp <<EOL
limit_req_zone \$binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Redirect all HTTP requests to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN_NAME;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Enable rate limiting
    limit_req zone=mylimit burst=20 nodelay;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # WebSocket / streaming
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Host y cabeceras de forwarding
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Streaming sin buffer
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;

        # Evitar caché del proxy
        proxy_cache_bypass \$http_upgrade;

        # Timeouts generosos para SSR/stream
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
EOL"

# Create symbolic link (idempotente)
sudo ln -sf /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/myapp

# Start/Reload Nginx
sudo nginx -t
sudo systemctl restart nginx

# Build and run the Docker containers from the app directory
cd "$APP_DIR"
sudo docker-compose up --build -d

# Check if Docker Compose started correctly
if ! sudo docker-compose ps | grep -q "Up"; then
  echo "Docker containers failed to start. Check logs with 'docker-compose logs'."
  exit 1
fi

# Setup automatic SSL certificate renewal...
( crontab -l 2>/dev/null; echo "0 */12 * * * certbot renew --quiet && systemctl reload nginx" ) | crontab -

# Final checks / hints
echo
echo "Deployment complete."
echo "➡ App: https://$DOMAIN_NAME"
echo "➡ Repo dir: $APP_DIR"
echo
echo "Si ves 502 en Nginx, verificá que algo esté escuchando en 127.0.0.1:3000:"
echo "  sudo ss -tulpn | grep :3000 || echo 'Nada escucha en 3000'"
echo "  curl -I http://127.0.0.1:3000"
echo
echo "Si tu contenedor no publica el puerto 3000 al host, agregá en docker-compose:"
echo '  ports: ["127.0.0.1:3000:3000"]'
