# FactureApp

FactureApp es una aplicación web completa (Full-Stack) diseñada para la gestión de facturación, clientes, productos, proveedores y control de gastos.

## Tecnologías Utilizadas

- **Frontend:** React, Vite, Tailwind CSS, React Router, Recharts, Framer Motion.
- **Backend:** Node.js, Express, Sequelize (ORM), PostgreSQL, JWT (Cookies `httpOnly`), Nodemailer.

## Estructura del Proyecto

El proyecto está estructurado como un monorepo con dos carpetas principales:

- `/frontend`: Aplicación cliente en React.
- `/backend`: Servidor API REST en Node.js/Express.

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado en tu sistema:

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [PostgreSQL](https://www.postgresql.org/) (versión 12 o superior)
- Git (opcional, para control de versiones)

## Instrucciones para ejecutar en local

### 1. Clonar o preparar el repositorio

Abre una terminal en la raíz del proyecto `factureapp`.

### 2. Configuración de la Base de Datos

1. Abre tu gestor de base de datos PostgreSQL (pgAdmin, DBeaver, o desde la terminal con `psql`).
2. Crea una base de datos nueva, por ejemplo: `facturaapp_db`.

```sql
CREATE DATABASE facturaapp_db;
```

### 3. Configuración del Backend

1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz de la carpeta `backend` copiando el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
4. Abre el archivo `.env` y configura los valores, especialmente los de la base de datos para que coincidan con tu instalación local de PostgreSQL:
   ```env
   DB_NAME=facturaapp_db
   DB_USER=postgres          # Tu usuario de PostgreSQL
   DB_PASSWORD=tu_contraseña # Tu contraseña de PostgreSQL
   DB_HOST=localhost
   DB_PORT=5432

   # Configuración del servidor
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # JWT (Seguridad)
   JWT_SECRET=tu_secreto_super_seguro_para_jwt

   # Otros (opcional para pruebas de correos/cron)
   CRON_SECRET=secreto_cron_local
   ```
5. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   *(El servidor se conectará a la base de datos y Sequelize sincronizará/creará las tablas automáticamente. Deberías ver un mensaje de que el servidor está corriendo en el puerto 3000).*

### 4. Configuración del Frontend

1. Abre una **nueva ventana/pestaña en tu terminal** y navega a la carpeta del frontend (desde la raíz del proyecto):
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   *(Vite levantará el proyecto frontend, por defecto en `http://localhost:5173`).*

### 5. Acceso a la aplicación

Abre tu navegador web y visita: [http://localhost:5173](http://localhost:5173). 

¡La aplicación ya debería estar funcionando correctamente en tu entorno local!
