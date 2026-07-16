# Voicebox Gratuit — Guide de Déploiement
## TTS haute qualité pour Maria AI, 100% gratuit

---

## Options gratuites

| Option | GPU | Qualité | Vitesse | Difficulté |
|--------|-----|---------|---------|------------|
| **1. Local (recommandé)** | Votre GPU | ⭐⭐⭐⭐⭐ | Rapide | Facile |
| **2. Google Colab** | T4 gratuit | ⭐⭐⭐⭐ | Moyen | Moyen |
| **3. Docker local** | Votre GPU | ⭐⭐⭐⭐⭐ | Rapide | Facile |
| **4. CPU mode** | Aucun | ⭐⭐⭐ | Lent | Très facile |

---

## Option 1: Installation locale (Recommandée)

### Étape 1: Télécharger Voicebox

```bash
# Windows (MSI)
# Télécharger: https://voicebox.sh/download/windows

# macOS (DMG)
# Télécharger: https://voicebox.sh/download/mac-arm
```

### Étape 2: Lancer Voicebox

1. Ouvrir Voicebox
2. Aller dans **Settings → Server**
3. Noter le port (défaut: 17493)
4. Garder Voicebox ouvert en arrière-plan

### Étape 3: Créer le profil "Maria"

1. Aller dans **Profiles**
2. Cliquer **+ New Profile**
3. Nom: "Maria"
4. Langue: Français
5. Enregistrer un échantillon vocal (10-30s de voix féminine claire)

### Étape 4: Configurer BeautyBook

Dans `backend/.env`:

```env
# Voicebox local (par défaut)
VOICEBOX_URL=http://127.0.0.1:17493
VOICEBOX_PROFILE=Maria
VOICEBOX_ENGINE=qwen
VOICEBOX_LANGUAGE=fr
```

### Étape 5: Tester

```bash
# Health check
curl http://localhost:17493/api/health

# Générer de la voix
curl -X POST http://localhost:17493/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Bonjour, je suis Maria!","profile":"Maria"}'
```

---

## Option 2: Google Colab (GPU gratuit)

### Étape 1: Ouvrir le notebook Colab

Créez un nouveau notebook Colab et collez ce code :

```python
# @title 🎤 Voicebox Server — GPU Gratuit
# @markdown Exécutez cette cellule pour lancer Voicebox avec un GPU gratuit

import subprocess
import time
import os

# Cloner Voicebox
print("📥 Clonage de Voicebox...")
!git clone https://github.com/jamiepine/voicebox.git
%cd voicebox/backend

# Installer les dépendances
print("📦 Installation des dépendances...")
!pip install -q -r requirements.txt
!pip install -q --no-deps chatterbox-tts
!pip install -q --no-deps hume-tada
!pip install -q git+https://github.com/QwenLM/Qwen3-TTS.git

# Lancer le serveur
print("🚀 Lancement du serveur Voicebox...")
print("⏳ Attendez le message 'Uvicorn running on http://0.0.0.0:17493'")
!uvicorn main:app --host 0.0.0.0 --port 17493
```

### Étape 2: Exposer le serveur avec ngrok

Dans une nouvelle cellule Colab :

```python
# @title 🌍 Exposer avec ngrok (URL publique gratuite)
# @markdown Crée une URL publique pour accéder à Voicebox depuis BeautyBook

!pip install -q pyngrok

from pyngrok import ngrok
import time

# Créer le tunnel
print("🔗 Création du tunnel ngrok...")
public_url = ngrok.connect(17493, "http")
print(f"\n✅ Voicebox accessible sur: {public_url}")
print(f"\n📋 Copiez cette URL dans backend/.env:")
print(f"VOICEBOX_URL={public_url}")

# Garder le tunnel actif
try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    ngrok.kill()
```

### Étape 3: Configurer BeautyBook

```env
VOICEBOX_URL=https://xxxx-xx-xx-xx-xx.ngrok-free.app
VOICEBOX_PROFILE=Maria
VOICEBOX_ENGINE=qwen
VOICEBOX_LANGUAGE=fr
```

### Limites Colab

- **GPU T4** gratuit (16GB VRAM)
- **Limite de session** : 12h max
- **Déconnexion** après inactivité (90 min)
- **ngrok** : URL change à chaque session

---

## Option 3: Docker local (tout-en-un)

### Étape 1: Installer Docker

```bash
# Windows/Mac: Télécharger Docker Desktop
# https://www.docker.com/products/docker-desktop

# Linux:
sudo apt install docker.io docker-compose
```

### Étape 2: Lancer Voicebox

```bash
cd deploy/voicebox

# Créer le docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  voicebox:
    image: nvidia/cuda:12.4.0-runtime-ubuntu22.04
    container_name: voicebox
    ports:
      - "17493:17493"
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    command: >
      bash -c "apt-get update && apt-get install -y python3 python3-pip python3-venv curl git &&
      git clone https://github.com/jamiepine/voicebox.git /app &&
      cd /app/backend && python3 -m venv venv && . venv/bin/activate &&
      pip install -r requirements.txt &&
      pip install --no-deps chatterbox-tts hume-tada &&
      pip install git+https://github.com/QwenLM/Qwen3-TTS.git &&
      uvicorn main:app --host 0.0.0.0 --port 17493"
    restart: unless-stopped

EOF

# Lancer
docker compose up -d

# Vérifier
docker compose logs -f voicebox
```

---

## Option 4: CPU mode (sans GPU)

Si vous n'avez pas de GPU, Voicebox fonctionne en CPU mais est plus lent.

### Étape 1: Installer Python

```bash
# Windows: Télécharger Python depuis python.org
# macOS: brew install python
# Linux: sudo apt install python3 python3-pip
```

### Étape 2: Installer Voicebox

```bash
git clone https://github.com/jamiepine/voicebox.git
cd voicebox/backend

# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
pip install --no-deps chatterbox-tts
pip install --no-deps hume-tada
pip install git+https://github.com/QwenLM/Qwen3-TTS.git
```

### Étape 3: Lancer en CPU

```bash
# Utiliser Kokoro (le plus léger, ~350MB)
uvicorn main:app --host 0.0.0.0 --port 17493
```

### Étape 4: Configurer BeautyBook

```env
VOICEBOX_URL=http://127.0.0.1:17493
VOICEBOX_PROFILE=Maria
VOICEBOX_ENGINE=kokoro
VOICEBOX_LANGUAGE=fr
```

### Performance CPU

| Moteur | Taille | Vitesse CPU |
|--------|--------|-------------|
| Kokoro | ~350MB | ~5-10s / 10 mots |
| Qwen | ~3.5GB | ~20-30s / 10 mots |
| Chatterbox | ~2GB | ~15-25s / 10 mots |

---

## Comparaison des options

| Option | Coût | GPU | Disponibilité | Qualité |
|--------|------|-----|---------------|---------|
| **Local** | 0€ | Votre GPU | 24/7 | ⭐⭐⭐⭐⭐ |
| **Colab** | 0€ | T4 gratuit | 12h/session | ⭐⭐⭐⭐ |
| **Docker** | 0€ | Votre GPU | 24/7 | ⭐⭐⭐⭐⭐ |
| **CPU** | 0€ | Aucun | 24/7 | ⭐⭐⭐ |

---

## Recommandation

**Pour un usage personnel** : Option 1 (Local)
- Gratuit, rapide, pas de limite
- Nécessite un PC allumé avec GPU NVIDIA

**Pour un usage partagé** : Option 3 (Docker)
- Gratuit, stable, redémarrage auto
- Nécessite un PC serveur toujours allumé

**Pour tester** : Option 2 (Colab)
- Gratuit, pas d'installation
- Limité à 12h, URL change

**Sans GPU** : Option 4 (CPU)
- Gratuit, marche partout
- Lent mais fonctionnel

---

## Configuration BeautyBook

Quelle que soit l'option choisie, configurez `backend/.env` :

```env
# Voicebox
VOICEBOX_URL=http://127.0.0.1:17493
VOICEBOX_PROFILE=Maria
VOICEBOX_ENGINE=qwen
VOICEBOX_LANGUAGE=fr
```

Puis redémarrez le backend :

```bash
cd backend
node src/server.js
```

---

## Moteurs TTS gratuits inclus

| Moteur | Taille | Qualité | Vitesse | Langues |
|--------|--------|---------|---------|---------|
| **Kokoro** | ~350MB | Bonne | Rapide | 10+ |
| **Qwen3-TTS** | ~3.5GB | Excellente | Moyen | 23 |
| **Chatterbox** | ~2GB | Très bonne | Moyen | 10+ |
| **LuxTTS** | ~1GB | Bonne | Rapide | 5+ |

**Recommandé** : `qwen` pour la meilleure qualité en français.
