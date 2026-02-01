@echo off
title DESPLIEGUE COMPLETO - OpenWitness
color 0B

echo ===================================================
echo   PREPARANDO Y SUBIENDO A GITHUB (TODO EN UNO)
echo ===================================================
echo.

echo 1. Copiando archivos a la carpeta 'dist'...
copy /Y index.html dist\
copy /Y dashboard.html dist\
copy /Y agency.html dist\
copy /Y login.html dist\
copy /Y app.js dist\
copy /Y data-store.js dist\
copy /Y utils.js dist\
copy /Y auth-service.js dist\
copy /Y firebase-config.js dist\
copy /Y components.js dist\
copy /Y styles.css dist\
copy /Y debug-error.js dist\
copy /Y test-map.html dist\
copy /Y test-firebase.html dist\
echo Archivos copiados.

echo.
echo 2. Añadiendo a Git...
git add .
git commit -m "Fix: Full sync and debug tools"

echo.
echo 3. Subiendo a GitHub...
echo (Si sale una ventana de Login, inicia sesion)
git push -u origin main

echo.
echo ===================================================
echo   LISTO!
echo ===================================================
echo Ahora ve a Netlify y espera 1 minuto.
echo.
pause
