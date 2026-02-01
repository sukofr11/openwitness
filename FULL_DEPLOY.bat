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
copy /Y profile.html dist\
copy /Y app.js dist\
copy /Y data-store.js dist\
copy /Y utils.js dist\
copy /Y news-service.js dist\
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
git commit -m "Feature: Multi-language (FR/DE/IT), War Categories, Branding & User Profile"

echo.
echo 3. Subiendo a GitHub...
echo (Si sale una ventana de Login, inicia sesion)
git push -u origin main

echo.
echo 4. Desplegando en Firebase Hosting...
firebase deploy --only hosting

echo.
echo ===================================================
echo   LISTO!
echo ===================================================
echo Tu sitio ya esta publicado en Firebase Hosting.
echo.
pause
