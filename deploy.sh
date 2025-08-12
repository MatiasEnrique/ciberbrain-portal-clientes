#!/usr/bin/env bash
# version 2 (webroot + Nginx) - idempotente
set -euo pipefail

# ========================
# Env Vars (EDITAR)
# ========================
DOMAIN_NAME="clientes.ciberbrain.net"       # tu dominio
EMAIL="contacto@ciberbrain.net"             # tu email para Certbot
REPO_URL="https://github.com/MatiasEnrique/ciberbrain-portal-clientes.git"
APP_DIR="$HOME/ciberbrain-portal-clientes"
SWAP_SIZE="1G"                               # tamaño de swap
APP_PORT="3000"                              # puerto donde escucha tu app dentro del host
# ========================

# Update & base tools
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget ca-certificates gnupg lsb-release software-properties-common

# Add Swap Space (idempotente)
if ! swapon --show | grep -q '^/swapfile'; then
  echo ">> Agregando swap $SWAP_SIZE..."
  sudo fallocate -l "$SWAP_SIZE" /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

# Install Docker Engine
if ! command -v docker >/dev/null 2>&1; then
  echo ">> Instalando Docker..."
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt update
  sudo apt install -y docker-ce docker-ce-cli containerd.io
  sudo systemctl enable docker
  sudo systemctl start docker
fi

# Install Docker Compose v2 (binario docker-compose)
if ! command -v docker-compose >/dev/null 2>&1; then
  echo ">> Instalando Docker Compose v2 (binario)..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
fi

# Verify Docker Compose installation
docker-compose --version >/dev/null || { echo "Docker Compose no se pudo instalar."; exit 1; }

# Clone or update the Git repository
if [ -d "$APP_DIR/.git" ]; then
  echo ">> Repo existente. Haciendo pull..."
  git -C "$APP_DIR" pull --rebase
else
  echo ">> Clonando repo $REPO_URL ..."
  git clone "$REPO_URL" "$APP_DIR"
fi

# Install Nginx & Certbot
sudo apt install -y nginx certbot

# UFW (si está habilitado, abrir 80/443)
if command -v ufw >/dev/null 2>&1; then
  if sudo ufw status | grep -q "Status: active"; then
    sudo ufw allow 80/tcp || true
    sudo ufw allow 443/tcp || true
  fi
fi

# Webroot para ACME
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot

# --- FASE 1: Config HTTP para obtener el cert (80 con excepción ACME) ---
sudo bash -c "cat > /etc/nginx/sites-available/myapp_http.conf <<'EOL'
server {
    listen 80;
    listen [::]:80;
    server_name __DOMAIN_NAME__;

    # Excepción para ACME (no redirigir)
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type \"text/plain\";
        allow all;
    }

    # El resto redirige a HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOL"
sudo sed -i "s#__DOMAIN_NAME__#${DOMAIN_NAME}#g" /etc/nginx/sites-available/myapp_http.conf

# Limpiar configs previas y habilitar HTTP temporal
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/myapp_http.conf /etc/nginx/sites-enabled/myapp_http.conf
sudo nginx -t
sudo systemctl reload nginx

# Obtener certificado usando webroot (sin bajar Nginx)
if [ ! -f "/etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem" ]; then
  echo ">> Obteniendo certificado para ${DOMAIN_NAME}..."
  sudo certbot certonly --webroot -w /var/www/certbot \
    -d "$DOMAIN_NAME" --non-interactive --agree-tos -m "$EMAIL"
else
  echo ">> Certificado existente para ${DOMAIN_NAME} detectado. Saltando emisión inicial."
fi

# Asegurar archivos comunes SSL (compat con include de certbot)
if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
  sudo wget -q https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/certbot-nginx/src/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -P /etc/letsencrypt/
fi
if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
  sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

# --- FASE 2: Config HTTPS + Proxy Pass (80 + 443) ---
sudo bash -c "cat > /etc/nginx/sites-available/myapp.conf <<'EOL'
# Zona de limitación de tasa (rate limit)
limit_req_zone \$binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    listen 80;
    listen [::]:80;
    server_name __DOMAIN_NAME__;

    # Excepción para ACME (no redirigir)
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type \"text/plain\";
        allow all;
    }

    # Redirección global a HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name __DOMAIN_NAME__;

    ssl_certificate /etc/letsencrypt/live/__DOMAIN_NAME__/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/__DOMAIN_NAME__/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Habilitar rate limiting
    limit_req zone=mylimit burst=20 nodelay;

    location / {
        proxy_pass http://127.0.0.1:__APP_PORT__;
        proxy_http_version 1.1;

        # WebSocket / streaming
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Cabeceras de forwarding
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
sudo sed -i "s#__DOMAIN_NAME__#${DOMAIN_NAME}#g" /etc/nginx/sites-available/myapp.conf
sudo sed -i "s#__APP_PORT__#${APP_PORT}#g" /etc/nginx/sites-available/myapp.conf

# Habilitar config final
sudo ln -sf /etc/nginx/sites-available/myapp.conf /etc/nginx/sites-enabled/myapp.conf
sudo rm -f /etc/nginx/sites-enabled/myapp_http.conf || true
sudo nginx -t
sudo systemctl reload nginx

# Build and run the Docker containers from the app directory
cd "$APP_DIR"
# Asegurá que tu docker-compose exponga 127.0.0.1:3000:3000 o similar
sudo docker-compose up --build -d

# Check containers status
if ! sudo docker-compose ps | grep -q "Up"; then
  echo ">> Los contenedores no iniciaron correctamente. Revisá logs con: docker-compose logs"
  exit 1
fi

# Renovación automática del certificado
( crontab -l 2>/dev/null; echo "0 */12 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'" ) | crontab -

# Final info
echo
echo "====================== DONE ======================"
echo "App:       https://${DOMAIN_NAME}"
echo "Repo dir:  ${APP_DIR}"
echo
echo "Si ves 502 en Nginx, verificá que algo esté escuchando en 127.0.0.1:${APP_PORT}:"
echo "  sudo ss -tulpn | grep :${APP_PORT} || echo 'Nada escucha en ${APP_PORT}'"
echo "  curl -I http://127.0.0.1:${APP_PORT}"
echo
echo "Si tu contenedor no publica el puerto ${APP_PORT} al host, agregá en docker-compose:"
echo "  ports: [\"127.0.0.1:${APP_PORT}:${APP_PORT}\"]"
echo "=================================================="
