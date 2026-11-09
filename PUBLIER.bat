@echo off
setlocal
cd /d "%~dp0"
echo ============================================
echo   SARKIN WANKA - PUBLIER UNE MISE A JOUR
echo ============================================
echo   1 = Mise a jour rapide (application seulement, sans APK)
echo   2 = Version complete (nouvel APK + mise a jour)
echo.
set /p CHOIX=Votre choix (1 ou 2) : 
set "ANDROID_HOME=%USERPROFILE%\android-sdk"
set "ANDROID_SDK_ROOT=%USERPROFILE%\android-sdk"
for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-21*") do set "JAVA_HOME=%%i"
(echo sdk.dir=%USERPROFILE:\=/%/android-sdk)> android\local.properties
if not exist node_modules call npm install
if "%CHOIX%"=="2" goto apk
call npm run publier
goto fin
:apk
if not defined JAVA_HOME (
  echo Java 21 introuvable : installez Temurin JDK 21.
  pause
  exit /b 1
)
call npm install
call npm run publier:apk
if exist dist\SarkinWanka.apk copy /y dist\SarkinWanka.apk "%USERPROFILE%\Desktop\SarkinWanka.apk"
:fin
echo.
pause
