#!/usr/bin/env bash
# deploy-standalone.sh
# Ubuntu + Docker + docker compose plugin + Nginx + Certbot (standalone) + redirects fix
set -euo pipefail

# ========================
# Env Vars (EDITAR)
# ========================
DOMAIN_NAME="clientes.ciberbrain.net"
EMAIL="contacto@ciberbrain.net"
REPO_URL="https://github.com/MatiasEnrique/ciberbrain-portal-clientes.git"
APP_DIR="$HOME/ciberbrain-portal-clientes"
SWAP_SIZE="1G"
APP_PORT="3000"          # Puerto interno donde escucha la app
CLIENT_MAX_BODY="20m"    # Tamaño máx. de upload
# ========================

export DEBIAN_FRONTEND=noninteractive

echo ">> Actualizando sistema..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y --no-install-recommends \
  git curl wget ca-certificates gnupg lsb-release software-properties-common \
  dnsutils jq nginx certbot cron

echo ">> Asegurando cron activo..."
sudo systemctl enable --now cron

# Swap idempotente
if ! swapon --show | grep -q '^/swapfile'; then
  echo ">> Agregando swap $SWAP_SIZE..."
  sudo fallocate -l "$SWAP_SIZE" /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

# Docker Engine + compose plugin
if ! command -v docker >/dev/null 2>&1; then
  echo ">> Instalando Docker Engine..."
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo systemctl enable --now docker
fi

# (Opcional) agregar usuario al grupo docker
if ! id -nG "$USER" | grep -qw docker; then
  sudo usermod -aG docker "$USER" || true
fi

echo ">> Comprobando docker compose plugin..."
sudo docker compose version >/dev/null

# UFW (si está activo) abrir 80/443
if command -v ufw >/dev/null 2>&1; then
  if sudo ufw status | grep -q "Status: active"; then
    sudo ufw allow 80/tcp || true
    sudo ufw allow 443/tcp || true
  fi
fi

# Clonar/actualizar repo
if [ -d "$APP_DIR/.git" ]; then
  echo ">> Repo existente. Actualizando..."
  git -C "$APP_DIR" fetch --all --prune
  git -C "$APP_DIR" pull --rebase --autostash
else
  echo ">> Clonando repo..."
  git clone --depth 1 "$REPO_URL" "$APP_DIR"
fi

# Asegurar .env mínimo (ajustá luego lo que necesites)
if [ ! -f "$APP_DIR/.env" ]; then
  {
    echo "NODE_ENV=production"
    echo "PORT=${APP_PORT}"
    echo "NEXTAUTH_URL=https://${DOMAIN_NAME}"
    # Agregá aquí el resto de tus variables (DATABASE_URL, etc.)
  } > "$APP_DIR/.env"
  echo ">> .env mínimo generado en $APP_DIR/.env"
fi

# Sanity DNS antes de emitir cert
DNS_IP="$(dig +short A ${DOMAIN_NAME} | tail -n1 || true)"
PUB_IP="$(curl -s https://api.ipify.org || curl -s ifconfig.me || true)"
if [ -n "${DNS_IP}" ] && [ -n "${PUB_IP}" ] && [ "${DNS_IP}" != "${PUB_IP}" ]; then
  echo ">> AVISO: A(${DOMAIN_NAME})=${DNS_IP} no coincide con IP pública=${PUB_IP}. Certbot puede fallar."
fi

# Parar Nginx para certbot --standalone
echo ">> Parando Nginx para emitir certificado (standalone)..."
sudo systemctl stop nginx || true

# Emitir certificado (standalone)
if [ ! -f "/etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem" ]; then
  echo ">> Obteniendo certificado para ${DOMAIN_NAME}..."
  sudo certbot certonly --standalone -d "${DOMAIN_NAME}" --non-interactive --agree-tos -m "${EMAIL}"
else
  echo ">> Certificado existente detectado. Saltando emisión inicial."
fi

# Archivos SSL comunes
if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
  sudo wget -q https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/certbot-nginx/src/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -P /etc/letsencrypt/
fi
if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
  sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

# Nginx config (con headers completos y proxy_redirect off)
sudo tee /etc/nginx/sites-available/myapp.conf >/dev/null <<'EOL'
# (Este archivo se incluye dentro de http {})
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    listen 80;
    listen [::]:80;
    server_name __DOMAIN_NAME__;

    # Redirección global a HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name __DOMAIN_NAME__;

    server_tokens off;
    client_max_body_size __CLIENT_MAX_BODY__;

    ssl_certificate /etc/letsencrypt/live/__DOMAIN_NAME__/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/__DOMAIN_NAME__/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 1.1.1.1 8.8.8.8 valid=300s;
    resolver_timeout 5s;

    # Rate limit
    limit_req zone=mylimit burst=20 nodelay;

    location / {
        proxy_pass http://127.0.0.1:__APP_PORT__;
        proxy_http_version 1.1;

        # WebSocket / SSE
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # Headers críticos para URLs y redirects
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # No tocar Location del upstream
        proxy_redirect off;

        # Streaming
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;
        proxy_cache_bypass $http_upgrade;

        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
EOL
sudo sed -i "s#__DOMAIN_NAME__#${DOMAIN_NAME}#g" /etc/nginx/sites-available/myapp.conf
sudo sed -i "s#__APP_PORT__#${APP_PORT}#g" /etc/nginx/sites-available/myapp.conf
sudo sed -i "s#__CLIENT_MAX_BODY__#${CLIENT_MAX_BODY}#g" /etc/nginx/sites-available/myapp.conf

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/myapp.conf /etc/nginx/sites-enabled/myapp.conf

echo ">> Iniciando Nginx..."
sudo nginx -t
sudo systemctl restart nginx

# Build & run containers
cd "$APP_DIR"
echo ">> Levantando contenedores..."
# Asegurate que tu compose publique 127.0.0.1:${APP_PORT}:${APP_PORT}
sudo docker compose up -d --build

echo ">> Verificando estado..."
if ! sudo docker compose ps | grep -Eiq "Up|running"; then
  echo ">> Los contenedores no iniciaron correctamente. Logs:"
  echo "   sudo docker compose logs --no-color --tail=200"
  exit 1
fi

# Renovación automática (root crontab)
CRON_LINE='0 3,15 * * * certbot renew --quiet --deploy-hook "systemctl reload nginx"'
if ! sudo crontab -l 2>/dev/null | grep -qF "$CRON_LINE"; then
  ( sudo crontab -l 2>/dev/null; echo "$CRON_LINE" ) | sudo crontab -
fi

echo
echo "====================== DONE ======================"
echo "App:       https://${DOMAIN_NAME}"
echo "Repo dir:  ${APP_DIR}"
echo
echo "Checks:"
echo "  sudo ss -ltnp | egrep ':(80|443|${APP_PORT})\\s' || true"
echo "  curl -I http://127.0.0.1:${APP_PORT} || true"
echo "=================================================="
