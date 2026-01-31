# Instrucciones de Despliegue

Esta carpeta (`dist`) contiene la versión de producción de la "Red de Testigos Confiables".

## Opción 1: Netlify (Recomendado)
1. Ve a [app.netlify.com](https://app.netlify.com).
2. Arrastra y suelta esta carpeta `dist` completa en el área "Sites".
3. ¡Listo! Tu web estará online en segundos.

## Opción 2: Vercel
1. Instala Vercel CLI: `npm i -g vercel`.
2. Ejecuta `vercel` dentro de esta carpeta.

## Opción 3: GitHub Pages
1. Sube el contenido de esta carpeta a un repositorio de GitHub.
2. Ve a Settings -> Pages y selecciona la rama `main` (o la que uses).

## NOTA IMPORTANTE - Producción
Recuerda que para que el Login y la Base de Datos funcionen en la web publicada, debes:
1. Ir a [Firebase Console](https://console.firebase.google.com/).
2. Ir a Authentication -> Sign-in method -> Dominios autorizados.
3. Añadir el dominio que te dé Netlify/Vercel (ej: `mi-app.netlify.app`).

Si no haces esto, Google bloqueará el inicio de sesión por seguridad.
