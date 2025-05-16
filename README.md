# Vidacel Task Manager – Guía de Instalación y Uso

> React + Vite (fuera de Docker) | API Node/Express + Sequelize + MySQL (en Docker)

---

## Índice rápido

1. [Requisitos previos](#requisitos-previos)
2. [Instalación paso a paso](#instalación-paso-a-paso)
3. [Variables de entorno](#variables-de-entorno)
4. [Arranque en desarrollo](#arranque-en-desarrollo)
5. [Flujo de trabajo diario](#flujo-de-trabajo-diario)
6. [Scripts útiles](#scripts-útiles)
7. [Solución de problemas](#solución-de-problemas)
8. [Preparar producción](#preparar-producción)

---

## Requisitos previos

| Herramienta        | Versión mínima | Comprobación             |
| ------------------ | -------------- | ------------------------ |
| **Docker Desktop** | 24.x           | `docker --version`       |
| **Docker Compose** | 2.5            | `docker compose version` |
| **Node.js**        | 20 LTS         | `node -v`                |
| **npm**            | 10+            | `npm -v`                 |
| Git (opcional)     | 2.40           | `git --version`          |

> En Windows/Mac basta con instalar **Docker Desktop**. En Linux instala `docker`, `docker-compose-plugin` y agrega tu usuario al grupo `docker` (`sudo usermod -aG docker $USER`).

---

## Instalación paso a paso

```bash
# 1. Clonar el repositorio
$ git clone https://github.com/Chelosky-O/vidacel-task-manager.git
$ cd vidacel-task-manager

# 2. Instalar dependencias del frontend
$ cd frontend
$ npm install
$ cd ..
```

---

## Variables de entorno

1. **Raíz del proyecto**: crea (o copia de `.env.example`) un archivo `.env` con:

   ```env
   MYSQL_ROOT_PASSWORD=supersecret
   MYSQL_DATABASE=vidacel
   MYSQL_USER=app
   MYSQL_PASSWORD=apppass
   ```

2. **Backend (`backend/.env`)** — **no es necesario editarlo**; Docker inyecta las variables del paso anterior.

3. **Frontend (`frontend/.env`)**:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

> 🔒 **Nunca** subas archivos `.env` a un repo público.

---

## Arranque en desarrollo

En **dos terminales**:

```bash
# Terminal A — backend + MySQL
docker compose up --build   # en la raíz del proyecto
```

```bash
# Terminal B — frontend
cd frontend
npm run dev -- --host       # Vite mostrará la URL (default: http://localhost:5173)
```

* Nodemon dentro del contenedor recarga el API en caliente.
* Vite recarga la SPA al guardar cambios.

Accede a:

* **SPA** → `http://localhost:5173`
* **API Health** → `http://localhost:5000/api/health`

---

## Flujo de trabajo diario

1. **Levanta contenedores** (`docker compose up`)
2. **Corre Vite** (`npm run dev`)
3. Edita código
4. Revisa la consola para hot‑reloads
5. **Detén** con `Ctrl‑C` (datos de MySQL se guardan en el volumen `db_data`)

---

## Scripts útiles

| Ubicación  | Script            | Acción                                     |
| ---------- | ----------------- | ------------------------------------------ |
| `frontend` | `npm run dev`     | Ejecuta Vite con hot‑reload                |
|            | `npm run build`   | Genera `dist/` listo para producción       |
|            | `npm run preview` | Sirve el build para verificación local     |
| `backend`  | `npm run start`   | Inicia API (Nodemon dentro del contenedor) |

---

## Solución de problemas

| Mensaje / Síntoma                            | Posible causa & solución                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| `Access denied for user ...`                 | Verifica variables en `.env` o recrea DB con usuario/contraseña correctos.    |
| `Cannot apply unknown utility class` en Vite | Asegúrate de usar Tailwind v4 y envolver `@apply` en `@layer utilities`.      |
| Cambios en backend no recargan               | Confirma que el volumen `./backend:/app` esté activo en `docker-compose.yml`. |
| Puerto 3306 o 5000 ocupado                   | Modifica puertos expuestos en `docker-compose.yml`.                           |

---

## Preparar producción

1. **Generar build del frontend** (fuera de Docker):

   ```bash
   cd frontend && npm run build
   ```

2. **(Opcional) Servicio `frontend` en Docker**

   Crea `frontend/Dockerfile` multi‑stage y añade un nuevo servicio al `docker-compose.yml`. Ejemplo:

   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:1.27-alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 80
   ```

3. **Levantar stack completo**:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
   ```

---

Disfruta del 🚀 **Vidacel Task Manager**.
¿Dudas? Abre un issue o escribe en el canal de #dev.
