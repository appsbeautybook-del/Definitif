@echo off
REM ========================================
REM Voicebox Cloud Test — BeautyBook
REM Teste la connexion au serveur cloud
REM ========================================

echo.
echo  ===================================
echo   Test Voicebox Cloud
echo  ===================================
echo.

set /p VOICEBOX_URL="Entrez l'URL de Voicebox cloud (ex: http://1.2.3.4): "

echo.
echo  [1/3] Test de connexion...
curl -s "%VOICEBOX_URL%/api/health" >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERREUR] Impossible de se connecter a %VOICEBOX_URL%
    echo.
    echo  Verifiez :
    echo  - L'URL est correcte
    echo  - Le serveur est en marche
    echo  - Le port 80 est ouvert
    echo.
    pause
    exit /b 1
)
echo  [OK] Connexion reussie
echo.

echo  [2/3] Test de generation vocale...
echo  (Cela peut prendre quelques secondes)
echo.
curl -X POST "%VOICEBOX_URL%/speak" ^
    -H "Content-Type: application/json" ^
    -d "{\"text\":\"Bonjour, je suis Maria!\",\"profile\":\"Maria\",\"engine\":\"kokoro\",\"language\":\"fr\"}"
echo.
echo.

echo  [3/3] Informations...
echo.
echo  URL: %VOICEBOX_URL%
echo.
echo  Pour configurer BeautyBook :
echo  VOICEBOX_URL=%VOICEBOX_URL%
echo  VOICEBOX_PROFILE=Maria
echo  VOICEBOX_ENGINE=kokoro
echo  VOICEBOX_LANGUAGE=fr
echo.

echo  ===================================
echo   Test termine
echo  ===================================
echo.
pause
