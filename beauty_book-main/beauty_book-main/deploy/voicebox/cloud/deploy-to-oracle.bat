@echo off
REM ========================================
REM Voicebox — Deploy to Oracle Cloud
REM Exécuter sur votre PC Windows
REM ========================================

echo.
echo  ===================================
echo   Deploy Voicebox to Oracle Cloud
echo  ===================================
echo.

set /p IP="Entrez l'IP publique de votre serveur Oracle: "
set /p KEY="Entrez le chemin de votre clé SSH (ex: %USERPROFILE%\.ssh\voicebox_key): "

echo.
echo  [1/4] Connexion au serveur...
echo.

REM Copier le script d'installation
scp -i "%KEY%" "%~dp0install-voicebox.sh" ubuntu@%IP%:/tmp/

echo  [2/4] Exécution du script d'installation...
echo  (Cela peut prendre 5-10 minutes)
echo.

ssh -i "%KEY%" ubuntu@%IP% "chmod +x /tmp/install-voicebox.sh && /tmp/install-voicebox.sh"

echo  [3/4] Vérification de la connexion...
echo.

curl -s "http://%IP%/api/health"

echo.
echo.
echo  [4/4] Terminé !
echo.
echo  ===================================
echo   Voicebox est en ligne !
echo  ===================================
echo.
echo  URL: http://%IP%
echo.
echo  Configurez backend/.env :
echo  VOICEBOX_URL=http://%IP%
echo  VOICEBOX_PROFILE=Maria
echo  VOICEBOX_ENGINE=kokoro
echo  VOICEBOX_LANGUAGE=fr
echo.
echo  Puis redémarrez le backend :
echo  cd backend
echo  node src/server.js
echo.
pause
