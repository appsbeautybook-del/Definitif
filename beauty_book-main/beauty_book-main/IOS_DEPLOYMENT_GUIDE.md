# Guide de Déploiement iOS - BeautyBook

## Prérequis

### 1. Compte Apple Developer Program
- Inscris-toi sur [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/)
- Coût : **99$/an**
- Nécessaire pour TestFlight et l'App Store

### 2. Configurer App Store Connect
1. Va sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Clique sur "Mes apps" → "+" → "Nouvelle app"
3. Remplis :
   - **Nom** : BeautyBook
   - **Bundle ID** : `com.appsbeautybook.app`
   - **SKU** : `beautybook-ios`
   - **Langue principale** : Français

---

## Configuration des Secrets GitHub

Va dans ton repo GitHub → Settings → Secrets and variables → Actions

### Secrets obligatoires

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `VITE_SUPABASE_URL` | URL Supabase | Ton projet Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Clé anon Supabase | Ton projet Supabase → Settings → API |
| `VITE_BACKEND_URL` | URL du backend | Ton backend déployé |
| `IOS_CERTIFICATE` | Certificat P12 en base64 | Voir ci-dessous |
| `IOS_CERTIFICATE_PASSWORD` | Mot de passe du P12 | Celui que tu as défini |
| `IOS_PROVISIONING_PROFILE` | Profil de provisioning en base64 | Voir ci-dessous |
| `APP_STORE_CONNECT_API_KEY_ID` | ID de la clé API | Voir ci-dessous |
| `APP_STORE_CONNECT_API_ISSUER` | Issuer ID | Voir ci-dessous |
| `APP_STORE_CONNECT_API_KEY` | Clé API P8 en base64 | Voir ci-dessous |
| `APPLE_TEAM_ID` | Team ID Apple | Voir ci-dessous |

---

## Générer les Certificats et Profils

### Étape 1 : Créer un Certificat iOS Distribution

#### Sur Mac (ou via un ami avec un Mac) :
1. Ouvre **Keychain Access**
2. Menu → Certificate Assistant → Request a Certificate from a Certificate Authority
3. Remplis ton email, laisse le CA vide
4. Sauvegarde le fichier `.certSigningRequest`

#### Sur le Member Center Apple :
1. Va sur [developer.apple.com/account/resources/certificates](https://developer.apple.com/account/resources/certificates)
2. Clique "+" → Choisis **iOS Distribution (App Store and Ad Hoc)**
3. Upload ton `.certSigningRequest`
4. Télécharge le certificat `.cer`

#### Convertir en P12 :
```bash
# Double-clique sur le .cer pour l'ajouter à Keychain
# Dans Keychain Access, clique droit sur le certificat → Export
# Choisis le format .p12
# Définis un mot de passe (celui que tu mettras en secret)
```

#### Convertir en Base64 :
```bash
base64 -i certificate.p12 | pbcopy
# Colle le résultat dans le secret IOS_CERTIFICATE
```

### Étape 2 : Créer un Profil de Provisioning

1. Va sur [developer.apple.com/account/resources/profiles](https://developer.apple.com/account/resources/profiles)
2. Clique "+" → Choisis **App Store Distribution**
3. Sélectionne ton Bundle ID : `com.appsbeautybook.app`
4. Sélectionne ton certificat
5. Sélectionne ton App ID
6. Nomme le profil : `BeautyBook Distribution`
7. Télécharge le `.mobileprovision`

#### Convertir en Base64 :
```bash
base64 -i profile.mobileprovision | pbcopy
# Colle le résultat dans le secret IOS_PROVISIONING_PROFILE
```

### Étape 3 : Créer une Clé API App Store Connect

1. Va sur [appstoreconnect.apple.com/access/api](https://appstoreconnect.apple.com/access/api)
2. Clique "+" pour générer une nouvelle clé
3. Nom : `GitHub Actions CI`
4. Accès : **Developer** (ou Admin)
5. Génère et télécharge la clé `.p8`
6. Note ton **Key ID** et **Issuer ID**

#### Convertir la clé en Base64 :
```bash
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
# Colle dans APP_STORE_CONNECT_API_KEY
```

#### Trouver ton Team ID :
- Va sur [developer.apple.com/account](https://developer.apple.com/account)
- Le Team ID est visible dans les détails du compte (10 caractères)

---

## Lancer le Build

### Depuis GitHub (recommandé)
1. Pousse ton code sur GitHub
2. Va dans **Actions** → **Build iOS & Upload to TestFlight**
3. Clique **Run workflow**
4. Entre la version (ex: `1.0.0`)
5. Clique **Run workflow**

### Le build prend environ 15-25 minutes

---

## Soumettre sur TestFlight

### Une fois le build terminé :

1. Va sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Va dans **BeautyBook** → **TestFlight**
3. Tu devrais voir ton build (l'upload peut prendre 5-10 min après le build)
4. Clique sur le build
5. Remplis les **Notes de la build** :
   ```
   BeautyBook v1.0.0
   
   Fonctionnalités :
   - Réservation de services beauté
   - Wallet BeautyPay
   - Programmes de fidélité
   - Messagerie intégrée
   ```

### Configurer les Testeurs Internes
1. Dans TestFlight → **Groupes de testeurs internes**
2. Ajoute les emails de tes testeurs (max 100)
3. Ils recevront un email avec un lien pour installer l'app

### Configurer les Testeurs Externes (optionnel)
1. Crée un groupe de testeurs externes
2. Tu peux jusqu'à 10 000 testeurs
3. Partage le lien public

---

## Soumettre à l'App Store

### Quand tu es prêt à publier :

1. Dans App Store Connect → **BeautyBook**
2. Clique sur la version à publier
3. Remplis les champs obligatoires :

#### Informations requises :
- **Description** : Décris l'app
- **Mots-clés** : SEO pour l'App Store
- **Support URL** : Ton site web
- **URL de la politique de confidentialité** : Obligatoire
- **Catégorie** : Beauté / Lifestyle
- **Captures d'écran** : iPhone 6.7", 6.5", 5.5" + iPad

#### Captures d'écran :
Utilise un outil comme :
- [Screenshot Maker](https://screenshotmaker.net/)
- [Previewed](https://previewed.app/)
- Ou prends des captures manuelles

4. Clique **"Prêt pour la soumission"**
5. Apple examine (24-48h généralement)
7. L'app sera publiée automatiquement ou tu peux choisir une publication manuelle

---

## Commandes Utiles Locales

```bash
# Builder le web
npm run build

# Sync Capacitor iOS
npm run cap:sync:ios

# Ouvrir dans Xcode (si tu as un Mac)
npm run cap:open:ios

# Build complet pour iOS
npm run cap:build:ios
```

---

## Dépannage

### Erreur "No matching provisioning profiles"
- Vérifie que ton profil de provisioning est bien installé
- Vérifie que le Bundle ID correspond

### Erreur "Code signing failed"
- Vérifie que le certificat P12 est valide
- Vérifie le mot de passe du certificat

### Erreur "No accounts with iOS Distribution program"
- Vérifie que tu es inscrit au Apple Developer Program ($99/an)

### Build échoue sur GitHub Actions
- Vérifie les logs dans l'onglet Actions
- Vérifie que tous les secrets sont configurés

---

## URLs Importantes

- **App Store Connect** : https://appstoreconnect.apple.com
- **Apple Developer** : https://developer.apple.com
- **TestFlight** : https://developer.apple.com/testflight/
- **Human Interface Guidelines** : https://developer.apple.com/design/human-interface-guidelines/
