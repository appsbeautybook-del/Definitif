# Voicebox sur Oracle Cloud Free Tier
## Guide pas à pas — 100% gratuit, 24/7

---

## Étape 1: Créer un compte Oracle Cloud

1. Allez sur **https://cloud.oracle.com/free**
2. Cliquez **Start for Free**
3. Remplissez le formulaire (carte bancaire pour vérification, sans frais)
4. Vérifiez votre email et confirmez
5. Connectez-vous au dashboard

---

## Étape 2: Créer une clé SSH

### Sur Windows (PowerShell)

```powershell
# Générer une clé SSH
ssh-keygen -t ed25519 -C "voicebox" -f "$env:USERPROFILE\.ssh\voicebox_key" -N ""

# Afficher la clé publique (à copier)
Get-Content "$env:USERPROFILE\.ssh\voicebox_key.pub"
```

### Sur Mac/Linux

```bash
ssh-keygen -t ed25519 -C "voicebox" -f ~/.ssh/voicebox_key -N ""
cat ~/.ssh/voicebox_key.pub
```

---

## Étape 3: Créer l'instance VM

1. Dashboard Oracle Cloud → **Create a VM instance**
2. **Nom**: `voicebox`
3. **Image**: Ubuntu 22.04 (ou Oracle Linux)
4. **Shape**: VM.Standard.A1.Flex (Always Free)
   - OCPUs: **4**
   - RAM: **24 GB**
5. **Clé SSH**: Collez la clé publique générée
6. **Create**

**Note**: L'instance est gratuite pour toujours (Always Free).

---

## Étape 4: Configurer le pare-feu

1. Dashboard → **Networking** → **Virtual Cloud Networks**
2. Cliquez sur votre VCN
3. **Security Lists** → **Default Security List**
4. **Add Ingress Rules** (ajouter 2 règles) :

| Règle | Source CIDR | Destination Port | Description |
|-------|-------------|------------------|-------------|
| 1 | 0.0.0.0/0 | 80, 443 | HTTP/HTTPS |
| 2 | 0.0.0.0/0 | 22 | SSH |

5. **Add** pour chaque règle

---

## Étape 5: Se connecter au serveur

### Sur Windows (PowerShell)

```powershell
# Récupérer l'IP publique depuis le dashboard Oracle Cloud
# Puis se connecter :
ssh -i "$env:USERPROFILE\.ssh\voicebox_key" ubuntu@<VOTRE_IP>
```

### Sur Mac/Linux

```bash
ssh -i ~/.ssh/voicebox_key ubuntu@<VOTRE_IP>
```

**Remplacez `<VOTRE_IP>` par l'IP publique de votre instance.**

---

## Étape 6: Installer Voicebox

Une fois connecté au serveur, collez ces commandes :

```bash
# Mise à jour
sudo apt update && sudo apt upgrade -y

# Installer Docker
sudo apt install -y docker.io docker-compose git curl

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Déconnexion et reconnexion pour appliquer
echo "Déconnectez-vous et reconnectez-vous avec la même commande SSH"
exit
```

Reconnectez-vous :

```bash
ssh -i ~/.ssh/voicebox_key ubuntu@<VOTRE_IP>
```

Puis continuez :

```bash
# Cloner Voicebox
git clone https://github.com/jamiepine/voicebox.git
cd voicebox/backend

# Créer le Dockerfile pour CPU
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
sudo docker build -t voicebox -f Dockerfile.cpu .

# Lancer Voicebox
sudo docker run -d \
    --name voicebox \
    --restart unless-stopped \
    -p 80:17493 \
    voicebox

# Vérifier que c'est en marche
sleep 15
curl http://localhost/api/health
```

Si vous voyez `{"status":"ok"}`, Voicebox est en ligne !

---

## Étape 7: Vérifier depuis votre PC

Ouvrez PowerShell sur votre PC et tapez :

```powershell
# Remplacez <VOTRE_IP> par l'IP de votre serveur Oracle
Invoke-WebRequest -Uri "http://<VOTRE_IP>/api/health" -UseBasicParsing
```

Si vous voyez `{"status":"ok"}`, c'est bon !

---

## Étape 8: Créer le profil Maria

1. Ouvrez **http://<VOTRE_IP>** dans votre navigateur
2. Allez dans **Profiles**
3. Cliquez **+ New Profile**
4. Nom: `Maria`
5. Langue: Français
6. Enregistrez un échantillon vocal (10-30s de voix féminine claire)
7. Cliquez **Save**

---

## Étape 9: Configurer BeautyBook

Dans `backend/.env` de votre projet BeautyBook :

```env
# Voicebox cloud — Oracle Cloud Free Tier
VOICEBOX_URL=http://<VOTRE_IP>
VOICEBOX_API_KEY=
VOICEBOX_PROFILE=Maria
VOICEBOX_ENGINE=kokoro
VOICEBOX_LANGUAGE=fr
```

**Remplacez `<VOTRE_IP>` par l'IP publique de votre serveur.**

Puis redémarrez le backend :

```powershell
cd backend
node src/server.js
```

---

## Étape 10: Tester

```powershell
# Vérifier la connexion
Invoke-WebRequest -Uri "http://localhost:3000/api/ai/voicebox-status" -UseBasicParsing
```

Résultat attendu : `{"available":true,"url":"http://<VOTRE_IP>"}`

---

## Résumé

| Étape | Action |
|-------|--------|
| 1 | Créer compte Oracle Cloud |
| 2 | Générer clé SSH |
| 3 | Créer instance VM (4 OCPU, 24GB RAM) |
| 4 | Ouvrir ports 80, 443, 22 |
| 5 | Se connecter en SSH |
| 6 | Installer Voicebox (Docker) |
| 7 | Vérifier depuis votre PC |
| 8 | Créer profil Maria |
| 9 | Configurer BeautyBook |
| 10 | Tester |

**Coût total: 0€ — Toujours gratuit (Always Free)**
