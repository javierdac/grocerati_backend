# Grocerati Backend

API REST para Grocerati, una app de listas de compras compartidas.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticacion
- Desplegado en Vercel (serverless)

## Endpoints

### Auth
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesion
- `GET /auth/me` - Obtener perfil
- `PATCH /auth/me` - Actualizar perfil

### Listas
- `GET /lists` - Mis listas
- `POST /lists` - Crear lista
- `GET /lists/:id` - Detalle de lista
- `PATCH /lists/:id` - Actualizar lista (nombre, icono)
- `DELETE /lists/:id` - Eliminar lista
- `POST /lists/join` - Unirse con codigo de invitacion
- `POST /lists/:id/leave` - Salir de lista
- `POST /lists/:id/remove-member` - Quitar miembro

### Items
- `GET /lists/:id/items` - Items de una lista
- `POST /lists/:id/items` - Agregar item
- `PATCH /lists/:id/items/:itemId` - Actualizar item
- `DELETE /lists/:id/items/:itemId` - Eliminar item
- `POST /lists/:id/items/clear-completed` - Limpiar completados

## Desarrollo local

```bash
cp .env.example .env  # configurar variables
npm install
npm run dev
```

## Variables de entorno

| Variable | Descripcion |
|----------|-------------|
| `PORT` | Puerto del servidor (default: 3001) |
| `MONGODB_URI` | URI de conexion a MongoDB |
| `JWT_SECRET` | Secret para firmar tokens JWT |

## Deploy en Vercel

```bash
vercel --prod
```

Las variables de entorno se configuran en el dashboard de Vercel o con `vercel env add`.
