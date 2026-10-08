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
     npm install --legacy-peer-deps && npm run build
     ```
     *(El flag `--legacy-peer-deps` o el archivo `.npmrc` ya incluido evita conflictos de dependencias entre Vite y Tailwind en Node 20+)*
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

## 🔗 Cómo Conectar Ambos: Vercel (Frontend) con Render (Backend API)

Esta es la arquitectura recomendada por ingenieros:
- **Vercel**: Sirve la web a los usuarios con la velocidad máxima de su CDN global (React + Vite).
- **Render**: Ejecuta el servidor Node.js/Express (`server.ts`) y atiende las llamadas `/api/*` y la base de datos MySQL.

```
[ Usuario en su Móvil/PC ] 
          │
          ▼ (Carga ultrarrápida)
   [ VERCEL: Frontend React ]  
          │
          ▼ (Llamadas API: /api/db/status, /api/db/test, etc.)
   [ RENDER: Backend Express Node.js ] 
          │
          ▼
   [ BASE DE DATOS MYSQL ]
```

### Paso 1: Despliega tu Backend en Render
1. Sigue los pasos de la **Opción 2** más arriba para crear tu **Web Service** en Render.
2. Una vez finalizado el deploy, copia la URL que te asigna Render, por ejemplo:
   `https://dominus-gym-api.onrender.com`
3. Comprueba que responda abriendo en tu navegador:
   `https://dominus-gym-api.onrender.com/api/health`
   *(Debe responder un JSON con `status: "ok"`)*.

---

### Paso 2: Conectar Vercel con la URL de Render

Tienes **2 opciones excelentes**:

#### Método A (Recomendado y más rápido): Variable de Entorno en Vercel
1. Entra a tu proyecto en [vercel.com](https://vercel.com).
2. Ve a la pestaña **Settings** ➔ **Environment Variables**.
3. Añade la siguiente variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://dominus-gym-api.onrender.com` *(la URL de tu Render sin barra final)*
4. Guarda y ve a **Deployments** ➔ Haz clic en los tres puntos (...) del último deployment ➔ **Redeploy**.
5. ¡Listo! El frontend ahora enviará todas sus consultas directamente a tu servidor en Render. El servidor ya cuenta con **CORS habilitado** para autorizar peticiones desde Vercel.

#### Método B: Proxy Silencioso en `vercel.json` (Sin CORS)
Si prefieres que Vercel reenvíe internamente las peticiones sin que el navegador cambie de dominio, edita tu archivo `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://dominus-gym-api.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Haz `git commit` y `git push` a GitHub y Vercel se actualizará automáticamente.

---

### Paso 3: Probar la Conexión desde el Panel de Admin
Dentro del sistema:
1. Abre el **Panel de Administración** (ícono de candado en la web).
2. Ve a la pestaña **"🚀 Despliegue (Vercel & Render)"**.
3. En la sección **"🔗 Conectar Ambos (Vercel + Render)"**:
   - Pega tu URL de Render.
   - Haz clic en **"Probar Salud (/api/health)"**.
   - Verás la latencia en milisegundos y el estado en vivo.
   - Haz clic en **"Guardar en Esta App"**.

---

### ⚠️ Consejo para el Plan Free de Render (Evitar suspensión / Cold Start)
En el plan gratuito de Render, los servidores se suspenden ("duermen") tras 15 minutos sin visitas y tardan unos 45 segundos en despertar con la primera petición.

Para mantener tu backend **100% despierto 24/7**:
1. Entra a [uptimerobot.com](https://uptimerobot.com) (gratis).
2. Crea un **HTTP Monitor** que consulte cada 10 minutos la URL:
   `https://tu-servicio-render.onrender.com/api/health`
3. ¡Listo! Render nunca entrará en suspensión y tus socios tendrán respuesta inmediata en cualquier momento del día.

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
