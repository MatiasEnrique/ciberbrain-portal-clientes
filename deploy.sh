#!/usr/bin/env bash
set -euo pipefail

# ========================
# Variables a EDITAR
# ========================
DOMAIN_NAME="portalclientes.ciberbrain.net"
EMAIL="contacto@ciberbrain.net"
REPO_URL="https://github.com/MatiasEnrique/ciberbrain-portal-clientes.git"
APP_DIR="$HOME/ciberbrain-portal-clientes"
SWAP_SIZE="1G"   # opcional
# ========================

echo "[1/7] Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

echo "[2/7] Creando swap si no existe..."
if ! swapon --show | grep -q '^/swapfile'; then
  sudo fallocate -l "$SWAP_SIZE" /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  sudo swapon /swapfile
fi

echo "[3/7] Instalando Docker Engine + Compose v2..."
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker

echo "[4/7] Instalando Nginx + Certbot (plugin nginx)..."
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable --now nginx

echo "[5/7] Configurando firewall..."
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow OpenSSH
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw --force enable
fi

echo "[6/7] Clonando/actualizando repositorio..."
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull
else
  git clone "$REPO_URL" "$APP_DIR"
fi

echo "[7/7] Creando .env si no existe (plantilla)..."
if [ ! -f "$APP_DIR/.env" ]; then
  cat > "$APP_DIR/.env" <<EOF
NODE_ENV=production
# AUTH_SECRET=
# DATABASE_URL=
# EMAIL_HOST=
# EMAIL_SENDER=
# EMAIL_SENDER_ALIAS=
# EMAIL_PORT=
# EMAIL_USER=
# EMAIL_PASSWORD=
# EMAIL_SSL=true
# RED_AGENTES=true
# UPLOAD_PATH=
# DOMAIN_NAME=$DOMAIN_NAME
EOF
  echo "  -> Se generó $APP_DIR/.env (editalo con tus secretos)."
fi

echo "Configurando Nginx reverse proxy..."
NGINX_MAP_CONF="/etc/nginx/conf.d/map_connection_upgrade.conf"
sudo bash -c "cat > '$NGINX_MAP_CONF' <<'MAP'
map \$http_upgrade \$connection_upgrade {
  default close;
  websocket upgrade;
}
MAP"

VHOST_PATH="/etc/nginx/sites-available/portal"
sudo bash -c "cat > '$VHOST_PATH' <<NGINX
limit_req_zone \$binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    listen 80;
    server_name ${DOMAIN_NAME};

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;
        limit_req zone=mylimit burst=20 nodelay;
    }

    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy strict-origin-when-cross-origin;
    add_header Permissions-Policy 'geolocation=(), microphone=(), camera=()';
    add_header Content-Security-Policy "default-src 'self' https: 'unsafe-inline' 'unsafe-eval' data: blob:";
}
NGINX"

sudo ln -sf "$VHOST_PATH" /etc/nginx/sites-enabled/portal
sudo nginx -t && sudo systemctl reload nginx

cd "$APP_DIR"
sudo docker compose up --build -d

echo "Solicitando certificado TLS con Certbot..."
sudo certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos -m "$EMAIL" || true
sudo nginx -t && sudo systemctl reload nginx

echo "Renovación automática SSL..."
( sudo crontab -l 2>/dev/null; echo '0 */12 * * * certbot renew --quiet && systemctl reload nginx' ) | sudo crontab -

echo "Listo ✅ App en: https://${DOMAIN_NAME}"
