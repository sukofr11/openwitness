@echo off
title Subir OpenWitness a GitHub
color 0A
echo ===================================================
echo   SUBIENDO PROYECTO A GITHUB (AUTOMATICO)
echo ===================================================
echo.
echo 1. Configurando repositorio...
git remote remove origin 2>nul
git remote add origin https://github.com/sukofr11/openwitness.git
git branch -M main

echo.
echo 2. Iniciando subida...
echo.
echo ---------------------------------------------------
echo  IMPORTANTE:
echo  Se va a abrir una ventana para iniciar sesion.
echo  Si no la ves, MIRA EN TU BARRA DE TAREAS.
echo ---------------------------------------------------
echo.
git push -u origin main
echo.

if %date%==0 (
    echo [EXITO] Tu codigo ya esta en GitHub.
    echo Ahora ve a Netlify e importa el proyecto.
) else (
    echo.
    echo Si hubo un error, asegurate de tener internet
    echo y de iniciar sesion correctamente.
)
echo.
pause
