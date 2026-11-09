@echo off
setlocal
rem Envoie le projet sur GitHub (sans la cle de signature, sans les dossiers generes).
set "URL=https://github.com/chamsoudine-dev/APK-SARKIN-WANKA.git"
set "SRC=%~dp0"
if "%SRC:~-1%"=="\" set "SRC=%SRC:~0,-1%"
set "DST=%USERPROFILE%\Desktop\sw-git"
if exist "%SRC%\.git" goto insrc
if not exist "%DST%\.git" (
  git clone "%URL%" "%DST%"
  if errorlevel 1 (
    echo Echec du clonage : verifiez votre connexion internet.
    pause
    exit /b 1
  )
)
robocopy "%SRC%" "%DST%" /E /XD node_modules .gradle build www hosting .git /XF local.properties keystore.properties *.keystore *.apk >nul
cd /d "%DST%"
goto commit
:insrc
cd /d "%SRC%"
:commit
git config user.name >nul 2>&1 || git config user.name "chamsoudine-dev"
git config user.email >nul 2>&1 || git config user.email "chamsoudine-dev@users.noreply.github.com"
git rm -r --cached --ignore-unmatch -q android/sarkin-wanka.keystore android/local.properties android/app/build android/build android/.gradle node_modules www
git rm -q --ignore-unmatch DEPLOYER_FIREBASE.bat GUIDE_DEPLOIEMENT.md
git add -A
set "MSG="
set /p MSG=Message de version (Entree = Mise a jour) : 
if "%MSG%"=="" set "MSG=Mise a jour"
git commit -m "%MSG%"
git push
echo.
echo Si "git push" a refuse : connectez-vous a GitHub (fenetre du navigateur) puis relancez ce fichier.
pause
