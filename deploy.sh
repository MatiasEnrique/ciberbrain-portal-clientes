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

step () { echo; echo "==> $1"; }

step "[1/9] Actualizando sistema..."
sudo apt update -y && sudo apt upgrade -y

step "[2/9] Creando swap si no existe..."
if ! swapon --show | grep -q '^/swapfile'; then
  sudo fallocate -l "$SWAP_SIZE" /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  sudo swapon /swapfile
fi

step "[3/9] Instalando Docker Engine + Compose v2..."
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
fi
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update -y
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker

step "[4/9] Instalando Nginx + Certbot (plugin nginx)..."
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable --now nginx || true

# Apagar Apache si estuviera ocupando 80/443
sudo systemctl stop apache2 2>/dev/null || true
sudo systemctl disable apache2 2>/dev/null || true

step "[5/9] Configurando firewall..."
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow OpenSSH
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw --force enable
fi

step "[6/9] Clonando/actualizando repositorio..."
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --rebase
else
  git clone "$REPO_URL" "$APP_DIR"
fi

step "[7/9] Creando .env si no existe (plantilla)..."
if [ ! -f "$APP_DIR/.env" ]; then
  cat > "$APP_DIR/.env" <<EOF
# --- Variables de entorno de producción ---
NODE_ENV=production

# AUTH / APP
# AUTH_SECRET=

# Base de datos SQL Server (externa)
# Ejemplo: sqlserver://HOST:1433;database=DB;user=USER;password=PASS;encrypt=true
# DATABASE_URL=

# SMTP
# EMAIL_HOST=
# EMAIL_PORT=465
# EMAIL_SSL=true
# EMAIL_SENDER=
# EMAIL_SENDER_ALIAS=
# EMAIL_USER=
# EMAIL_PASSWORD=

# Otros de tu app
# RED_AGENTES=true
# UPLOAD_PATH=
DOMAIN_NAME=$DOMAIN_NAME
EOF
  echo "  -> Se generó $APP_DIR/.env (editalo con tus secretos)."
fi

step "[8/9] Configurando Nginx reverse proxy..."

# Backup y asegurar include wildcard (eliminar restos de 'myapp')
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak.$(date +%F-%H%M%S)
sudo sed -i '/include \\/etc\\/nginx\\/sites-enabled\\/myapp;/d' /etc/nginx/nginx.conf || true
# Reemplaza cualquier include específico por el wildcard
sudo sed -ri 's@^\s*include\s+/etc/nginx/sites-enabled/[^;]+;@    include /etc/nginx/sites-enabled/*;@' /etc/nginx/nginx.conf
# Asegura que exista el include wildcard (si no estaba)
sudo grep -q 'include /etc/nginx/sites-enabled/\*;' /etc/nginx/nginx.conf || \
  sudo sed -i '/include \/etc\/nginx\/conf\.d\/\*\.conf;/a\    include /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf

# En contexto http: map websockets y zona de rate limit (idempotentes)
sudo tee /etc/nginx/conf.d/map_connection_upgrade.conf >/dev/null <<'MAP'
map $http_upgrade $connection_upgrade {
  default close;
  websocket upgrade;
}
MAP

sudo tee /etc/nginx/conf.d/ratelimit.conf >/dev/null <<'RATE'
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;
RATE

# VHost (sin limit_req_zone dentro del server {}), cuidando que los $ no se expandan
VHOST_PATH="/etc/nginx/sites-available/portal"
sudo tee "$VHOST_PATH" >/dev/null <<NGINX
server {
    listen 80;
    server_name ${DOMAIN_NAME};

    # Challenge HTTP de certbot si hace falta
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # WebSockets / streaming
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;

        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;

        # Aplica rate limit configurado en http
        limit_req zone=mylimit burst=20 nodelay;

        # Hardening básico
        add_header X-Frame-Options "DENY";
        add_header X-Content-Type-Options "nosniff";
        add_header Referrer-Policy "strict-origin-when-cross-origin";
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";
        add_header Content-Security-Policy "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; frame-ancestors 'none'";
    }
}
NGINX

# Habilitar vhost y deshabilitar default
sudo ln -sf "$VHOST_PATH" /etc/nginx/sites-enabled/portal
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/myapp /etc/nginx/sites-available/myapp || true

# Probar Nginx y recargar/arrancar
if sudo nginx -t; then
  if systemctl is-active --quiet nginx; then
    sudo systemctl reload nginx
  else
    sudo systemctl start nginx
  fi
else
  echo "❌ nginx -t falló. Revisá la configuración."
  exit 1
fi

step "[9/9] Build & deploy con Docker Compose..."
cd "$APP_DIR"
# (si tu repo necesita bun.lockb y no está, recordá agregarlo; el Dockerfile tolerante funciona sin lock)
sudo docker compose up --build -d

# Solicitar/instalar certificados TLS con plugin nginx (no falla si DNS aún no propagó)
echo
echo "Emitiendo certificado TLS con Certbot..."
sudo certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos -m "$EMAIL" || true
sudo nginx -t && sudo systemctl reload nginx || sudo systemctl start nginx

# Renovación automática (root)
( sudo crontab -l 2>/dev/null; echo '0 */12 * * * certbot renew --quiet && systemctl reload nginx' ) | sudo crontab -

echo
echo "✅ Listo. App en: https://${DOMAIN_NAME}"
echo "➡ Código en: ${APP_DIR}"
echo "⚠️ Recordá completar ${APP_DIR}/.env con tus secretos si aún no lo hiciste y luego:"
echo "   cd ${APP_DIR} && sudo docker compose up -d --build"
