#!/bin/bash
# ========================================
# Voicebox — Deploy on Oracle Cloud Free Tier
# 100% gratuit, toujours actif
# ========================================

set -e

echo ""
echo "=================================="
echo "  Voicebox — Oracle Cloud Free"
echo "=================================="
echo ""

# Vérifier si on est sur Ubuntu
if ! grep -q "Ubuntu" /etc/os-release 2>/dev/null; then
    echo "[ERREUR] Ce script est pour Ubuntu/Debian"
    exit 1
fi

# Installer les dépendances
echo "[1/5] Installation des dépendances..."
sudo apt update
sudo apt install -y docker.io docker-compose git curl

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Cloner Voicebox
echo "[2/5] Clonage de Voicebox..."
if [ ! -d "voicebox" ]; then
    git clone https://github.com/jamiepine/voicebox.git
fi

# Créer le Dockerfile optimisé pour CPU
echo "[3/5] Création du Dockerfile..."
cd voicebox

cat > Dockerfile.cpu << 'EOF'
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git curl build-essential && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/jamiepine/voicebox.git .

WORKDIR /app/backend

RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir --no-deps chatterbox-tts && \
    pip install --no-cache-dir --no-deps hume-tada && \
    pip install --no-cache-dir git+https://github.com/QwenLM/Qwen3-TTS.git

EXPOSE 17493

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "17493", "--workers", "1"]
EOF

# Construire l'image
echo "[4/5] Construction de l'image Docker..."
sudo docker build -t voicebox -f Dockerfile.cpu .

# Lancer le conteneur
echo "[5/5] Lancement de Voicebox..."
sudo docker run -d \
    --name voicebox \
    --restart unless-stopped \
    -p 80:17493 \
    voicebox

# Attendre que le serveur démarre
echo "Attente du démarrage..."
sleep 10

# Vérifier
if curl -s http://localhost/api/health > /dev/null 2>&1; then
    echo ""
    echo "=================================="
    echo "  Voicebox est en ligne !"
    echo "=================================="
    echo ""
    echo "URL: http://$(curl -s ifconfig.me)"
    echo ""
    echo "Pour créer le profil Maria :"
    echo "1. Ouvrez http://$(curl -s ifconfig.me)"
    echo "2. Allez dans Profiles"
    echo "3. Créez un profil 'Maria'"
    echo "4. Enregistrez un échantillon vocal"
    echo ""
    echo "Configurez BeautyBook :"
    echo "VOICEBOX_URL=http://$(curl -s ifconfig.me)"
    echo "VOICEBOX_PROFILE=Maria"
    echo "VOICEBOX_ENGINE=kokoro"
    echo "VOICEBOX_LANGUAGE=fr"
    echo ""
else
    echo "[ERREUR] Voicebox n'a pas démarré correctement"
    echo "Vérifiez les logs: sudo docker logs voicebox"
fi
