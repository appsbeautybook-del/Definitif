# Guide de Déploiement Voicebox — Production
## TTS haute qualité pour Maria AI, accessible en ligne

---

## Architecture

```
Utilisateurs → BeautyBook Backend → Voicebox Server (GPU) → Audio
                     ↓
              Cache + Rate Limiting
```

---

## Option 1: Serveur GPU dédié (Recommandé)

### 1.1 Choisir un provider GPU

| Provider | GPU | RAM | Prix/h | Lien |
|----------|-----|-----|--------|------|
| **RunPod** | RTX 4090 | 24GB | ~$0.40 | runpod.io |
| **Vast.ai** | RTX 3090 | 24GB | ~$0.20 | vast.ai |
| **AWS** | g5.xlarge | 16GB | ~$1.00 | aws.amazon.com |
| **Lambda** | A10G | 24GB | ~$0.60 | lambdalabs.com |

### 1.2 Setup du serveur

```bash
# SSH dans le serveur GPU
ssh root@<GPU_SERVER_IP>

# Installer Docker + NVIDIA
curl -fsSL https://get.docker.com | sh
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker

# Cloner Voicebox
git clone https://github.com/jamiepine/voicebox.git
cd voicebox/backend

# Installer les dépendances
pip install -r requirements.txt
pip install --no-deps chatterbox-tts hume-tada
pip install git+https://github.com/QwenLM/Qwen3-TTS.git

# Lancer Voicebox (accessible depuis l'extérieur)
uvicorn main:app --host 0.0.0.0 --port 17493
```

### 1.3 Sécuriser avec nginx + API key

```bash
# Générer une clé API
API_KEY=$(openssl rand -hex 32)
echo "Votre clé API: $API_KEY"

# Installer nginx
sudo apt-get install -y nginx

# Créer la config
sudo nano /etc/nginx/conf.d/voicebox.conf
# (Copier le contenu de deploy/voicebox/nginx.conf)
# Remplacer CHANGE_ME_TO_RANDOM_HEX par $API_KEY

# SSL avec Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d voicebox.ton-domaine.com

# Redémarrer nginx
sudo systemctl restart nginx
```

### 1.4 Configurer BeautyBook

Dans `backend/.env`:

```env
# URL du serveur Voicebox distant
VOICEBOX_URL=https://voicebox.ton-domaine.com

# Clé API (same que dans nginx.conf)
VOICEBOX_API_KEY=your_generated_api_key_here

# Profil vocal par défaut
VOICEBOX_PROFILE=Maria
VOICEBOX_ENGINE=qwen
VOICEBOX_LANGUAGE=fr
```

---

## Option 2: Docker Compose (tout-en-un)

### 2.1 Setup

```bash
cd deploy/voicebox

# Générer une clé API
API_KEY=$(openssl rand -hex 32)
echo "API Key: $API_KEY"

# Modifier nginx.conf avec la clé
sed -i "s/CHANGE_ME_TO_RANDOM_HEX/$API_KEY/g" nginx.conf

# Lancer
docker compose up -d

# Vérifier
docker compose logs -f voicebox
curl http://localhost:17493/api/health
```

### 2.2 Configurer BeautyBook

```env
VOICEBOX_URL=https://voicebox.ton-domaine.com
VOICEBOX_API_KEY=$API_KEY
```

---

## Option 3: Voicebox Cloud (SaaS)

Voicebox n'est pas encore disponible en SaaS. Les options ci-dessus sont les seules pour le moment.

---

## Vérification

### Tester la connexion

```bash
# Health check
curl https://voicebox.ton-domaine.com/api/health

# Générer de la voix
curl -X POST https://voicebox.ton-domaine.com/speak \
  -H "Content-Type: application/json" \
  -H "X-Voicebox-Api-Key: YOUR_API_KEY" \
  -d '{"text":"Bonjour, je suis Maria!","profile":"Maria","engine":"qwen","language":"fr"}'
```

### Tester depuis BeautyBook

```bash
# Endpoint de status
curl http://localhost:3000/api/ai/voicebox-status

# Générer de la voix via le backend
curl -X POST http://localhost:3000/api/ai/voicebox-speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Bonjour, je suis Maria!"}'
```

---

## Performance

| GPU | Vitesse | Qualité |
|-----|---------|---------|
| RTX 4090 | ~2-3s / 10 mots | Excellente |
| RTX 3090 | ~3-4s / 10 mots | Excellente |
| RTX 3060 | ~5-7s / 10 mots | Bonne |
| CPU (12 cores) | ~20-30s / 10 mots | Acceptable |

**Recommandation**: RTX 3090 minimum pour une expérience utilisateur fluide.

---

## Scaling

### Pour 100+ utilisateurs simultanés

1. **GPU plus puissant** (RTX 4090 ou A100)
2. **Load balancing** avec plusieurs instances Voicebox
3. **Cache agressif** (déjà implémenté, TTL 30min)
4. **Rate limiting** (déjà implémenté dans nginx)

### Monitoring

```bash
# Logs Voicebox
docker compose logs -f voicebox

# Stats cache
curl http://localhost:3000/api/ai/voicebox-status

# Métriques GPU
nvidia-smi
```

---

## Sécurité

1. **API key obligatoire** — nginx rejette les requêtes sans clé
2. **HTTPS** — Let's Encrypt gratuit
3. **Rate limiting** — 10 req/s par IP sur /speak
4. **Pas d'auth sur /audio/** — les音频 généré sont publics (normal)
5. **VPN optionnel** — pour un accès encore plus sûr

---

## Coûts estimés

| Composant | Coût/mois |
|-----------|-----------|
| GPU (RTX 3090, Vast.ai) | ~$150 |
| Domaine + SSL | ~$1 |
| Bande passante | ~$10 |
| **Total** | **~$160/mois** |

---

## FAQ

**Q: Voicebox est-il compatible avec le RGPD ?**
Oui. Tout tourne sur votre serveur, aucune donnée n'est envoyée vers des services tiers.

**Q: Combien de langues sont supportées ?**
23 langues dont le français.

**Q: Puis-je utiliser une voix personnalisée ?**
Oui. Créez un profil dans Voicebox avec un échantillon audio de 10-30 secondes.

**Q: Que faire si Voicebox est lent ?**
Vérifiez que le GPU est bien utilisé (`nvidia-smi`). Si non, installez nvidia-docker2.
