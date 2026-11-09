@echo off
rem Construit seulement l'APK (pour tester), sans rien publier. Resultat : SarkinWanka.apk sur le Bureau.
setlocal
cd /d "%~dp0"
set "ANDROID_HOME=%USERPROFILE%\android-sdk"
set "ANDROID_SDK_ROOT=%USERPROFILE%\android-sdk"
for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-21*") do set "JAVA_HOME=%%i"
(echo sdk.dir=%USERPROFILE:\=/%/android-sdk)> android\local.properties
call npm install
call npm run sync
cd android
call gradlew.bat assembleRelease
copy /y app\build\outputs\apk\release\app-release.apk "%USERPROFILE%\Desktop\SarkinWanka.apk"
pause
