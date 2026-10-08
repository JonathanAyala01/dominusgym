# 🚀 Guía de Despliegue: DOMINUS GYM Rifa (Vercel & Render)

Esta guía te explica paso a paso cómo poner en producción tu aplicación en **Vercel** (ideal para la web frontend) y en **Render** (ideal para servidor completo con backend Node.js y MySQL).

---

## 🟢 Opción 1: Despliegue en VERCEL (Recomendado para la Web Frontend)

Vercel es la plataforma más rápida y gratuita para alojar aplicaciones Vite/React.

### Pasos en Vercel:
1. **Sube tu código a GitHub o GitLab**:
   - Crea un repositorio nuevo en GitHub (ej: `dominus-gym-rifa`).
   - Sube los archivos del proyecto a ese repositorio.

2. **Conecta tu cuenta en Vercel**:
   - Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
   - Haz clic en **"Add New..."** ➔ **"Project"**.
   - Selecciona tu repositorio `dominus-gym-rifa` y dale a **"Import"**.

3. **Configuración del Proyecto (Project Settings)**:
   - **Framework Preset**: Detectará automáticamente `Vite`.
   - **Root Directory**: `./` (dejar por defecto).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Archivo `vercel.json`**:
   - Ya está incluido en el repositorio con las redirecciones SPA:
     ```json
     {
       "buildCommand": "npm run build",
       "outputDirectory": "dist",
       "framework": "vite",
       "rewrites": [
         { "source": "/(.*)", "destination": "/index.html" }
       ]
     }
     ```
   - Esto evita errores 404 al recargar cualquier página.

5. **Deploy**:
   - Haz clic en **"Deploy"**.
   - En menos de 1 minuto tendrás tu dominio activo tipo: `https://dominus-gym-rifa.vercel.app`.
   - Puedes asignarle tu propio dominio personalizado en **Settings ➔ Domains** (ej: `rifa.dominusgym.com`).

---

## 🟣 Opción 2: Despliegue en RENDER (Full-Stack con Servidor Node.js)

Render es excelente si quieres que tu backend Express (`server.ts`) corra en vivo para gestionar APIs y conexión con base de datos MySQL en la nube.

### Método A: Usando el Blueprint automático (`render.yaml`)
1. Sube tu código a GitHub.
2. En [render.com](https://dashboard.render.com), haz clic en **"New"** ➔ **"Blueprint"**.
3. Conecta tu repositorio. Render leerá automáticamente el archivo `render.yaml` ya configurado en el proyecto.
4. Haz clic en **"Apply"** y se desplegará solo.

### Método B: Manualmente como "Web Service" en Render
1. En tu panel de Render, haz clic en **"New"** ➔ **"Web Service"**.
2. Conecta tu repositorio de GitHub.
3. Completa los siguientes campos:
   - **Name**: `dominus-gym-rifa`
   - **Region**: Selecciona la más cercana (ej: `Ohio (US East)` o `Frankfurt`).
   - **Branch**: `main`
   - **Language / Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: `Free` ($0/mes)

4. **Variables de Entorno (Environment Variables)**:
   Agrega en la sección *Environment Variables*:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render asigna el puerto automáticamente)
   
   *(Opcional: Si conectas una base de datos MySQL en la nube como Clever Cloud, Aiven, Railway o PlanetScale)*:
   - `MYSQL_HOST`: tu host de MySQL
   - `MYSQL_PORT`: `3306`
   - `MYSQL_DATABASE`: `dominus_rifa`
   - `MYSQL_USER`: tu usuario
   - `MYSQL_PASSWORD`: tu contraseña
   - `MYSQL_SSL`: `true`

5. Haz clic en **"Deploy Web Service"**.
   - Render construirá la app y te dará una URL pública HTTPS gratuita tipo:
     `https://dominus-gym-rifa.onrender.com`.

---

## 💡 ¿Cuál elegir?

| Característica | Vercel | Render |
| :--- | :--- | :--- |
| **Tipo de app** | Frontend React Ultrarrápido | Servidor Full-Stack Node.js |
| **Tiempo de despliegue** | ~30 segundos | ~2 minutos |
| **Velocidad CDN** | Global instantánea | Rápida |
| **Backend Express activo** | Requiere Serverless Functions | Nativo 24/7 |
| **Costo** | Gratis | Gratis |

¡Ambos métodos están listos para usar con los archivos de configuración incluidos en el proyecto!
