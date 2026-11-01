@echo off
echo ============================================
echo   DEPLOIEMENT SARKIN WANKA sur FIREBASE
echo ============================================
echo.
echo Etape 1: Connexion a Firebase...
call npx firebase-tools@latest login
echo.
echo Etape 2: Mise en ligne du site (Hosting uniquement)...
call npx firebase-tools@latest deploy --only hosting --project sarkin-wanka
echo.
echo ============================================
echo   DEPLOIEMENT TERMINE !
echo   Site disponible sur:
echo   https://sarkin-wanka.web.app
echo ============================================
pause
