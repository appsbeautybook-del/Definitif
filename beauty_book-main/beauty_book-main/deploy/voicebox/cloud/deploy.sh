#!/bin/bash
# ========================================
# Voicebox Cloud Deploy — BeautyBook
# Déploiement gratuit sur Oracle Cloud Free Tier
# ========================================

set -e

# Configuration
DOMAIN="${1:-voicebox.yourdomain.com}"
EMAIL="${2:-admin@yourdomain.com}"
API_KEY="${3:-$(openssl rand -hex 32)}"

echo ""
echo "=================================="
echo "  Voicebox Cloud Deploy"
echo "=================================="
echo ""
echo "Domaine: $DOMAIN"
echo "Email: $EMAIL"
echo "API Key: $API_KEY"
echo ""

# Installer Docker
echo "[1/6] Installation de Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "[OK] Docker installé"
else
    echo "[OK] Docker déjà installé"
fi

# Installer Docker Compose
echo "[2/6] Installation de Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "[OK] Docker Compose installé"
else
    echo "[OK] Docker Compose déjà installé"
fi

# Créer la configuration nginx
echo "[3/6] Configuration de nginx..."
mkdir -p certbot/conf certbot/www

cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    limit_req_zone $binary_remote_addr zone=voicebox:10m rate=10r/s;

    upstream voicebox {
        server voicebox:17493;
    }

    server {
        listen 80;
        server_name DOMAIN_PLACEHOLDER;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name DOMAIN_PLACEHOLDER;

        ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location /api/ {
            limit_req zone=voicebox burst=20 nodelay;

            if ($http_authorization != "Bearer API_KEY_PLACEHOLDER") {
                return 401 '{"error":"Invalid API key"}';
            }

            proxy_pass http://voicebox;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/health {
            proxy_pass http://voicebox;
        }

        location /speak {
            limit_req zone=voicebox burst=5 nodelay;

            if ($http_authorization != "Bearer API_KEY_PLACEHOLDER") {
                return 401 '{"error":"Invalid API key"}';
            }

            proxy_pass http://voicebox;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            proxy_read_timeout 120s;
            proxy_send_timeout 120s;
        }
    }
}
EOF

sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx.conf
sed -i "s/API_KEY_PLACEHOLDER/$API_KEY/g" nginx.conf
echo "[OK] nginx configuré"

# Lancer les services
echo "[4/6] Lancement de Voicebox..."
docker-compose up -d --build voicebox

echo "[5/6] Obtention du certificat SSL..."
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email

echo "[6/6] Redémarrage de nginx..."
docker-compose up -d

echo ""
echo "=================================="
echo "  Déploiement terminé !"
echo "=================================="
echo ""
echo "URL Voicebox: https://$DOMAIN"
echo "API Key: $API_KEY"
echo ""
echo "Configurez backend/.env :"
echo "VOICEBOX_URL=https://$DOMAIN"
echo "VOICEBOX_API_KEY=$API_KEY"
echo "VOICEBOX_PROFILE=Maria"
echo "VOICEBOX_ENGINE=qwen"
echo "VOICEBOX_LANGUAGE=fr"
echo ""
echo "Pour créer le profil Maria :"
echo "1. Ouvrez https://$DOMAIN dans votre navigateur"
echo "2. Créez un profil 'Maria'"
echo "3. Enregistrez un échantillon vocal"
echo ""
