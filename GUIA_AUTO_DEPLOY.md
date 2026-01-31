# Guía de Despliegue Automático (CI/CD)

Para no tener que subir la carpeta manual cada vez, lo estándar y más profesional es conectar tu proyecto a **GitHub**.

## Paso 1: Inicializar Git (Si no lo has hecho)
Abre la terminal en tu carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "Primera version lista para produccion"
```

## Paso 2: Subir a GitHub
1. Crea un repositorio nuevo en [github.com](https://github.com/new).
2. Copia los comandos que te salen para "push an existing repository".
   (Serán parecidos a `git remote add origin ...` y `git push ...`)

## Paso 3: Conectar Netlify a GitHub (¡Magia!)
1. Ve a tu panel de [Netlify](https://app.netlify.com/).
2. Haz clic en **"Add new site"** -> **"Import from an existing project"**.
3. Elige **GitHub**.
4. Busca y selecciona tu repositorio (el que acabas de crear).
5. En "Publish directory", escribe: `dist`
6. Dale a **"Deploy Site"**.

## ¡Listo! 🚀
A partir de ahora, cada vez que hagas un cambio en tu código, solo tienes que ejecutar esto en tu terminal:

```bash
git add .
git commit -m "Descripción de lo que arreglaste"
git push origin main
```

Netlify verá el cambio, construirá tu web y la actualizará automáticamente en segundos. ¡Adiós a arrastrar carpetas!
