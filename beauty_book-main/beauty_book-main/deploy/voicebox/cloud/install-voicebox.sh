#!/bin/bash
# ========================================
# Voicebox — Install on Oracle Cloud Free
# Exécuter sur le serveur Ubuntu
# ========================================

set -e

echo ""
echo "=================================="
echo "  Voicebox — Oracle Cloud Install"
echo "=================================="
echo ""

# Mise à jour
echo "[1/7] Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# Installer Docker
echo "[2/7] Installation de Docker..."
if ! command -v docker &> /dev/null; then
    sudo apt install -y docker.io docker-compose git curl
    sudo usermod -aG docker $USER
    echo "[OK] Docker installé"
else
    echo "[OK] Docker déjà installé"
fi

# Cloner Voicebox
echo "[3/7] Clonage de Voicebox..."
if [ ! -d "voicebox" ]; then
    git clone https://github.com/jamiepine/voicebox.git
fi
cd voicebox/backend

# Créer le Dockerfile pour CPU
echo "[4/7] Création du Dockerfile..."
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

# Construire l'image Docker
echo "[5/7] Construction de l'image Docker..."
sudo docker build -t voicebox -f Dockerfile.cpu .

# Arrêter l'ancien conteneur s'il existe
echo "[6/7] Arrêt de l'ancien conteneur..."
sudo docker stop voicebox 2>/dev/null || true
sudo docker rm voicebox 2>/dev/null || true

# Lancer Voicebox
echo "[7/7] Lancement de Voicebox..."
sudo docker run -d \
    --name voicebox \
    --restart unless-stopped \
    -p 80:17493 \
    voicebox

# Attendre que le serveur démarre
echo "Attente du démarrage (30 secondes)..."
sleep 30

# Vérifier
if curl -s http://localhost/api/health > /dev/null 2>&1; then
    IP=$(curl -s ifconfig.me)
    echo ""
    echo "=================================="
    echo "  Voicebox est en ligne !"
    echo "=================================="
    echo ""
    echo "URL: http://$IP"
    echo ""
    echo "Pour créer le profil Maria :"
    echo "1. Ouvrez http://$IP"
    echo "2. Allez dans Profiles"
    echo "3. Créez un profil 'Maria'"
    echo "4. Enregistrez un échantillon vocal"
    echo ""
    echo "Configurez BeautyBook :"
    echo "VOICEBOX_URL=http://$IP"
    echo "VOICEBOX_PROFILE=Maria"
    echo "VOICEBOX_ENGINE=kokoro"
    echo "VOICEBOX_LANGUAGE=fr"
    echo ""
else
    echo "[ERREUR] Voicebox n'a pas démarré"
    echo "Vérifiez: sudo docker logs voicebox"
fi
