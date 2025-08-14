#!/usr/bin/env bash
# version 3 (Ubuntu + webroot + Nginx + docker compose plugin + hardening)
set -euo pipefail

# ========================
# Env Vars (EDITAR)
# ========================
DOMAIN_NAME="clientes.ciberbrain.net"
EMAIL="contacto@ciberbrain.net"
REPO_URL="https://github.com/MatiasEnrique/ciberbrain-portal-clientes.git"
APP_DIR="$HOME/ciberbrain-portal-clientes"
SWAP_SIZE="1G"
APP_PORT="3000"          # Puerto interno de la app (host)
CLIENT_MAX_BODY="20m"    # Tamaño máx. de upload
# ========================

export DEBIAN_FRONTEND=noninteractive

echo ">> Actualizando sistema y herramientas base..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y --no-install-recommends \
  git curl wget ca-certificates gnupg lsb-release software-properties-common \
  dnsutils jq nginx certbot cron

echo ">> Asegurando cron activo para renovaciones..."
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

# (Opcional) agregar usuario al grupo docker para sesiones futuras
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

# Asegurar .env para que el arranque no falle
if [ ! -f "$APP_DIR/.env" ]; then
  if [ -f "$APP_DIR/.env.example" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo ">> .env creado desde .env.example (ajústalo si hace falta)."
  else
    echo -e "NEXT_PUBLIC_APP_NAME=PortalClientes\nNODE_ENV=production" > "$APP_DIR/.env"
    echo ">> .env mínimo generado (ajústalo)."
  fi
fi

# Nginx: webroot para ACME
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot

# HTTP temporal para ACME (sin expansión de variables bash)
sudo tee /etc/nginx/sites-available/myapp_http.conf >/dev/null <<'EOL'
server {
    listen 80;
    listen [::]:80;
    server_name __DOMAIN_NAME__;

    # ACME challenge
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type text/plain;
        allow all;
    }

    # Redirigir resto a HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
EOL
sudo sed -i "s#__DOMAIN_NAME__#${DOMAIN_NAME}#g" /etc/nginx/sites-available/myapp_http.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/myapp_http.conf /etc/nginx/sites-enabled/myapp_http.conf
sudo nginx -t
sudo systemctl reload nginx

# Sanity check DNS vs IP pública (no aborta, solo avisa)
DNS_IP="$(dig +short A ${DOMAIN_NAME} | tail -n1 || true)"
PUB_IP="$(curl -s https://api.ipify.org || curl -s ifconfig.me || true)"
if [ -n "${DNS_IP}" ] && [ -n "${PUB_IP}" ] && [ "${DNS_IP}" != "${PUB_IP}" ]; then
  echo ">> AVISO: El A de ${DOMAIN_NAME} (${DNS_IP}) no coincide con la IP pública (${PUB_IP}). Certbot podría fallar."
fi

# Emitir certificado (webroot)
if [ ! -f "/etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem" ]; then
  echo ">> Obteniendo certificado para ${DOMAIN_NAME}..."
  if ! sudo certbot certonly --webroot -w /var/www/certbot \
      -d "${DOMAIN_NAME}" --non-interactive --agree-tos -m "${EMAIL}"; then
    echo ">> ERROR: No se pudo emitir el certificado. Verificá DNS/puerto 80 y reintentá."
    exit 1
  fi
else
  echo ">> Certificado existente detectado. Saltando emisión inicial."
fi

# Asegurar archivos SSL comunes
if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
  sudo wget -q https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/certbot-nginx/src/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -P /etc/letsencrypt/
fi
if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
  sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

# Config final HTTPS + reverse proxy (sin expansión de variables bash)
sudo tee /etc/nginx/sites-available/myapp.conf >/dev/null <<'EOL'
# ====== http-level (este archivo se incluye dentro de http {}) ======
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    listen 80;
    listen [::]:80;
    server_name __DOMAIN_NAME__;

    # ACME challenge
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type text/plain;
        allow all;
    }

    # Redirección global a HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
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

    # Seguridad adicional
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # OCSP stapling (requiere resolver)
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 1.1.1.1 8.8.8.8 valid=300s;
    resolver_timeout 5s;

    # Rate limiting
    limit_req zone=mylimit burst=20 nodelay;

    location / {
        proxy_pass http://127.0.0.1:__APP_PORT__;
        proxy_http_version 1.1;

        # WebSocket / SSE
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # Forwarding
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Streaming sin buffer
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;

        # Evitar caché del proxy
        proxy_cache_bypass $http_upgrade;

        # Timeouts generosos para SSR/stream
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
EOL
sudo sed -i "s#__DOMAIN_NAME__#${DOMAIN_NAME}#g" /etc/nginx/sites-available/myapp.conf
sudo sed -i "s#__APP_PORT__#${APP_PORT}#g" /etc/nginx/sites-available/myapp.conf
sudo sed -i "s#__CLIENT_MAX_BODY__#${CLIENT_MAX_BODY}#g" /etc/nginx/sites-available/myapp.conf

sudo ln -sf /etc/nginx/sites-available/myapp.conf /etc/nginx/sites-enabled/myapp.conf
sudo rm -f /etc/nginx/sites-enabled/myapp_http.conf || true
sudo nginx -t
sudo systemctl reload nginx

# Build & run containers
cd "$APP_DIR"
echo ">> Levantando contenedores con docker compose..."
# Asegúrate que en tu compose el servicio web exponga 127.0.0.1:${APP_PORT}:${APP_PORT}
sudo docker compose up -d --build

echo ">> Verificando estado de contenedores..."
if ! sudo docker compose ps | grep -Eiq "Up|running"; then
  echo ">> Los contenedores no iniciaron correctamente. Revisá logs con:"
  echo "   sudo docker compose logs --no-color --tail=200"
  exit 1
fi

# Renovación automática (root crontab)
( sudo crontab -l 2>/dev/null; echo '0 3,15 * * * certbot renew --quiet --deploy-hook "systemctl reload nginx"' ) | sudo crontab -

echo
echo "====================== DONE ======================"
echo "App:       https://${DOMAIN_NAME}"
echo "Repo dir:  ${APP_DIR}"
echo
echo "Checks útiles:"
echo "  sudo ss -ltnp | egrep ':(80|443|${APP_PORT})\\s' || true"
echo "  curl -I http://127.0.0.1:${APP_PORT} || true"
echo
echo "Si ves 502 en Nginx, asegurá que el servicio publica 127.0.0.1:${APP_PORT}:${APP_PORT} en tu docker-compose."
echo "=================================================="
