# Voicebox Cloud — Déploiement Gratuit en Ligne
## Hébergement Voicebox sur Oracle Cloud Free Tier (100% gratuit)

---

## Option 1: Oracle Cloud Free Tier (Recommandé — Toujours gratuit)

### Étape 1: Créer un compte Oracle Cloud

1. Allez sur https://cloud.oracle.com/free
2. Créez un compte (carte bancaire requise pour vérification, sans frais)
3. Sélectionnez **Always Free** (toujours gratuit)

### Étape 2: Créer une instance VM

1. Dashboard → **Create Instance**
2. Nom: `voicebox`
3. Image: **Ubuntu 22.04** (ou Oracle Linux)
4. Shape: **VM.Standard.A1.Flex** (Always Free)
   - OCPUs: 4
   - RAM: 24 GB
5. Clé SSH: Uploadez votre clé publique
6. **Create**

### Étape 3: Configurer le pare-feu

1. **Networking** → **Virtual Cloud Networks** → votre VCN
2. **Security Lists** → **Default Security List**
3. **Add Ingress Rules**:
   - Source CIDR: `0.0.0.0/0`
   - Destination Port: `80, 443`
4. **Add Ingress Rules**:
   - Source CIDR: `0.0.0.0/0`
   - Destination Port: `22` (SSH)

### Étape 4: Connexion SSH

```bash
ssh -i ~/.ssh/votre_cle.pem ubuntu@<IP_PUBLIC>
```

### Étape 5: Déployer Voicebox

```bash
# Télécharger le script de déploiement
curl -sL https://raw.githubusercontent.com/.../deploy-cloud-oracle.sh | bash

# Ou manuellement:
sudo apt update && sudo apt install -y docker.io docker-compose
git clone https://github.com/jamiepine/voicebox.git
cd voicebox/backend
sudo docker build -t voicebox .
sudo docker run -d --name voicebox -p 80:17493 voicebox
```

### Étape 6: Configurer BeautyBook

```env
VOICEBOX_URL=http://<IP_PUBLIC>
VOICEBOX_PROFILE=Maria
VOICEBOX_ENGINE=kokoro
VOICEBOX_LANGUAGE=fr
```

**Note**: Sans GPU, utilisez `kokoro` (le plus léger, ~350MB).

---

## Option 2: Google Cloud Free Trial ($300 de crédit)

### Étape 1: Créer un compte

1. Allez sur https://cloud.google.com/free
2. Créez un compte avec $300 de crédit gratuit

### Étape 2: Créer une instance VM

1. **Compute Engine** → **VM instances** → **Create**
2. Nom: `voicebox`
3. Région: `us-central1`
4. Machine type: `e2-medium` (2 vCPU, 4 GB RAM)
5. Image: **Ubuntu 22.04**
6. Firewall: Allow HTTP, HTTPS
7. **Create**

### Étape 3: Déployer Voicebox

```bash
ssh -i ~/.ssh/votre_cle.pem user@<IP>

# Installer Docker
sudo apt update && sudo apt install -y docker.io docker-compose

# Cloner et lancer
git clone https://github.com/jamiepine/voicebox.git
cd voicebox/backend
sudo docker build -t voicebox .
sudo docker run -d --name voicebox -p 80:17493 voicebox
```

---

## Option 3: Hébergeur gratuit avec Docker

### Render.com (Free Tier)

1. Créez un compte sur https://render.com
2. **New** → **Web Service**
3. Connectez votre repo GitHub
4. **Docker** → Build Command: `docker build -t voicebox .`
5. **Docker** → Start Command: `uvicorn main:app --host 0.0.0.0 --port 17493`
6. Free Tier: 512 MB RAM, 750h/mois

### Railway.app (Free Trial)

1. Créez un compte sur https://railway.app
2. **New Project** → **Deploy from GitHub**
3. Sélectionnez votre repo
4. Railway détecte automatiquement le Dockerfile
5. Free Trial: $5 de crédit

---

## Option 4: VPS pas cher (GPU inclus)

### Vast.ai (RTX 3090 ~$0.10-0.20/h)

1. Créez un compte sur https://vast.ai
2. **租赁** → **On-Demand**
3. Filtre: GPU `RTX 3090`, RAM `24 GB+`, Disk `50 GB+`
4. Sélectionnez une instance (~$0.10/h)
5. **SSH**: `ssh root@<IP> -p <PORT>`

```bash
# Installer Voicebox
apt update && apt install -y python3 python3-pip git
git clone https://github.com/jamiepine/voicebox.git
cd voicebox/backend
pip install -r requirements.txt
pip install --no-deps chatterbox-tts hume-tada
pip install git+https://github.com/QwenLM/Qwen3-TTS.git
uvicorn main:app --host 0.0.0.0 --port 17493
```

### RunPod (RTX 4090 ~$0.40/h)

1. Créez un compte sur https://runpod.io
2. **Pods** → **Deploy**
3. Sélectionnez GPU: `RTX 4090`
4. Template: `RunPod PyTorch 2.1`
5. **Deploy On-Demand**

---

## Configuration BeautyBook pour cloud

Dans `backend/.env` :

```env
# Voicebox cloud
VOICEBOX_URL=https://voicebox.votredomaine.com
VOICEBOX_API_KEY=votre_cle_api
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

## Créer le profil Maria en ligne

1. Ouvrez `https://voicebox.votredomaine.com`
2. Allez dans **Profiles**
3. **+ New Profile**
4. Nom: `Maria`
5. Langue: Français
6. Enregistrez un échantillon vocal (10-30s de voix féminine claire)
7. **Save**

---

## Vérifier la connexion

```bash
# Health check
curl https://voicebox.votredomaine.com/api/health

# Générer de la voix
curl -X POST https://voicebox.votredomaine.com/speak \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer votre_cle_api" \
  -d '{"text":"Bonjour, je suis Maria!","profile":"Maria"}'
```

---

## Résumé des coûts

| Option | Coût | GPU | Performance |
|--------|------|-----|-------------|
| **Oracle Cloud Free** | 0€/mois | Non | ⭐⭐ (CPU) |
| **Google Cloud Free** | 0€ (300$ crédit) | Non | ⭐⭐ (CPU) |
| **Render Free** | 0€/mois | Non | ⭐ (CPU limité) |
| **Vast.ai** | ~$0.10/h | RTX 3090 | ⭐⭐⭐⭐⭐ |
| **RunPod** | ~$0.40/h | RTX 4090 | ⭐⭐⭐⭐⭐ |

**Recommandation** :
- **Usage personnel** → Oracle Cloud Free (0€, toujours gratuit)
- **Usage intensif** → Vast.ai (GPU pas cher)
- **Production** → RunPod (meilleure qualité)
