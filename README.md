# Vidacel Task Manager

> **Stack** : React + Vite (frontend) · Node/Express + Sequelize · MySQL (back‑ & DB in Docker)
>
> **Roles** : solicitante · sg (Servicios Generales) · admin (Gerencia)
>
> **Flujo principal** : solicitante crea → admin asigna → SG ejecuta → reportes.

---

## 0 · Requisitos

| Herramienta           | Versión recomendada | Comprobación             |
| --------------------- | ------------------- | ------------------------ |
| Docker Desktop        | ≥ 24                | `docker --version`       |
| Docker Compose Plugin | ≥ 2.5               | `docker compose version` |
| Node.js               | 20 LTS              | `node -v`                |
| npm                   | ≥ 10                | `npm -v`                 |
| Git (opcional)        | —                   | `git --version`          |

---

## 1 · Clonar e instalar

```powershell
PS> git clone https://github.com/Chelosky-O/vidacel-task-manager.git
PS> cd Proyecto-TICS2

# Instalar dependencias backend
PS> cd backend; npm i; cd ..

# Instalar dependencias frontend
PS> cd frontend; npm i; cd ..
```

---
## 2 · Arranque en desarrollo

```powershell
# Terminal 1 – backend + MySQL
PS> docker compose up --build

# Terminal 2 – frontend (hot‑reload)
PS> cd frontend
PS> npm run dev -- --host
```

* API → `http://localhost:5000/api/health`
* SPA → `http://localhost:5173`

Al iniciarse la BBDD se crea un **usuario admin** por defecto:

```
admin@vidacel.local / admin123
```

---

## 4 · Flujo diario

1. `docker compose up`  (backend + db)
2. `npm run dev` en `frontend/`
3. ⌨️ Edita código → backend recarga (nodemon), frontend recarga (Vite).
4. `Ctrl‑C` para detener; los datos persisten en el volumen `db_data`.

---

## 5 · Estructura principal

```
vidacel-task-manager/
│
├─ docker-compose.yml        # backend + db
├─ .env                      # creds globales
│
├─ backend/
│   ├─ Dockerfile            # nodemon
│   ├─ package.json
│   └─ src/ (rutas, modelos, middleware)
│
└─ frontend/
    ├─ vite.config.js
    ├─ package.json
    └─ src/ (pages, api, auth, layout)
```

---

## 6 · Scripts útiles

| Carpeta  | Script                | Descripción                  |
| -------- | --------------------- | ---------------------------- |
| backend  | `npm start` (nodemon) | Usado dentro del contenedor  |
| frontend | `npm run dev`         | Vite + Hot Reload            |
|          | `npm run build`       | Compilación estática `dist/` |
|          | `npm run preview`     | Sirve la build localmente    |

---