# 📋 Gestor de Tareas Web - TFG UOC

## Descripción del Proyecto

Aplicación web completa para la gestión de tareas personales, desarrollada como Trabajo de Fin de Grado (TFG) de Desarrollo Web en la Universitat Oberta de Catalunya (UOC). La aplicación permite a los usuarios registrarse, autenticarse y gestionar sus tareas de manera eficiente con una interfaz moderna y responsive.

**🌐 Aplicación en vivo:** [https://tfg-gestor-tareas.vercel.app](https://tfg-gestor-tareas.vercel.app)

### 🚀 Características Principales

- ✅ **Autenticación segura** con JWT
- 📝 **CRUD completo de tareas** (Crear, Leer, Actualizar, Eliminar)
- 🎨 **Interfaz moderna y responsive**
- 🌙 **Modo oscuro/claro**
- 🌍 **Soporte multiidioma** (Español/Inglés)
- 📊 **Estadísticas de tareas**
- 🔍 **Filtros avanzados**
- ⚡ **Actualizaciones optimistas**
- 🔒 **Validación de datos** en frontend y backend

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React** 19.1+ (Create React App)
- **React Router** 7.6+ para navegación SPA
- **React i18next** 11.18+ para internacionalización
- **CSS3** moderno con variables CSS y responsive design
- **Testing Library** para testing de componentes

### Backend
- **Node.js** 18+ con Express 4.19+
- **Sequelize ORM** 6.37+ para gestión de base de datos
- **JWT** para autenticación stateless
- **bcrypt** para hash seguro de contraseñas (12 rounds)
- **Express Validator** para validación de datos
- **Express Rate Limit** para protección contra ataques
- **CORS** configurado para producción

### Base de Datos
- **PostgreSQL** (desarrollo y producción)

### Despliegue
- **Frontend**: Vercel (https://tfg-gestor-tareas.vercel.app)
- **Backend**: Render
- **Base de Datos**: PostgreSQL en Render

---

## 📁 Estructura del Proyecto

```
tfg-gestor-tareas/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── hooks/           # Custom hooks
│   │   ├── i18n/            # Configuración de idiomas
│   │   └── App.js           # Componente principal
│   ├── public/
│   └── package.json
│
├── backend/                  # API REST con Node.js
│   ├── config/              # Configuración de base de datos
│   ├── controllers/         # Lógica de negocio
│   ├── models/              # Modelos de Sequelize
│   ├── routes/              # Rutas de la API
│   ├── middlewares/         # Middlewares personalizados
│   ├── migrations/          # Migraciones de base de datos
│   └── index.js             # Punto de entrada del servidor
│
└── README.md                # Este archivo
```

---

## ⚙️ Configuración Local

### Prerrequisitos

- **Node.js** (versión 18 o superior)
- **PostgreSQL** (versión 12 o superior)
- **Git**

### 1. Clonar el repositorio

```bash
git clone https://github.com/dieste46/tfg-gestor-tareas.git
cd tfg-gestor-tareas
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend` (usar `.env.example` como referencia):

```env
# ================================
# CONFIGURACIÓN BASE DE DATOS
# ================================
DB_USERNAME=admin
DB_PASSWORD=tu_password
DB_NAME=gestor_tareas
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DIALECT=postgres

# ================================
# CONFIGURACIÓN DEL SERVIDOR
# ================================
NODE_ENV=development
PORT=4000

# ================================
# AUTENTICACIÓN JWT
# ================================
JWT_SECRET=tfg-uoc-2025-gestor-tareas-secreto-super-seguro
JWT_EXPIRES_IN=24h

# ================================
# CORS Y FRONTEND
# ================================
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
FRONTEND_URL=http://localhost:3000

# ================================
# RATE LIMITING
# ================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# ================================
# LOGGING
# ================================
LOG_LEVEL=info
```

### 3. Configurar la Base de Datos

```bash
# Crear la base de datos PostgreSQL
createdb gestor_tareas

# Ejecutar migraciones en orden
npm run migrate

# Verificar que las tablas se crearon correctamente
psql gestor_tareas -c "\dt"
```

**Migraciones incluidas:**
- `20250515215939-create-tarea.js` - Crear tabla Tareas
- `20250516114320-create-usuario.js` - Crear tabla Usuarios  
- `20250516135703-add-usuarioId-to-tarea.js` - Relación Usuario-Tarea
- `20250531061950-add-nombre-to-usuarios.js` - Campo nombre opcional

### 4. Iniciar el Backend

```bash
npm run dev    # Desarrollo con nodemon
# o
npm start      # Producción con node
```

El servidor estará disponible en `http://localhost:4000`

### 5. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env` en la carpeta `frontend`:

```env
REACT_APP_API_URL=http://localhost:4000
```

### 6. Iniciar el Frontend

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

---

## 🚀 Despliegue en Producción

### Backend en Render

1. Crear cuenta en [Render.com](https://render.com)
2. Conectar repositorio de GitHub
3. Crear **PostgreSQL Database**
4. Crear **Web Service** con estas configuraciones:

**Environment Variables:**
```
DB_HOST=tu-host-postgresql.render.com
DB_PORT=5432
DB_NAME=nombre_de_tu_bd
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_DIALECT=postgres
JWT_SECRET=clave_super_secreta_para_produccion
NODE_ENV=production
```

**Build Command:** `npm install`
**Start Command:** `node index.js`

### Frontend en Vercel

1. Crear cuenta en [Vercel.com](https://vercel.com)
2. Conectar repositorio de GitHub
3. Configurar:

**Root Directory:** `frontend`

**Environment Variables:**
```
REACT_APP_API_URL=https://tu-backend.onrender.com
```

**Build Command:** `npm run build`  
**Output Directory:** `build`  
**Install Command:** `npm install`

---

## 📚 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/registro` | Registrar usuario |

### Tareas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tareas` | Obtener todas las tareas |
| POST | `/api/tareas` | Crear nueva tarea |
| PUT | `/api/tareas/:id` | Actualizar tarea |
| DELETE | `/api/tareas/:id` | Eliminar tarea |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Estado del servidor |

---

## 🧪 Testing

### Ejecutar tests del backend

```bash
cd backend
npm test
```

### Ejecutar tests del frontend

```bash
cd frontend
npm test
```

---

## 🔒 Seguridad

- **Autenticación JWT** con tokens seguros
- **Encriptación de contraseñas** con bcrypt (12 rounds)
- **Validación de datos** en cliente y servidor
- **CORS configurado** para dominios específicos
- **Variables de entorno** para datos sensibles
- **SSL/HTTPS** en producción

---

## 🌍 Internacionalización

La aplicación soporta múltiples idiomas:

- **Español** (por defecto)
- **Inglés**

Los archivos de traducción están en `frontend/src/i18n/`

---

## 📱 Responsive Design

- **Mobile First** approach
- **Breakpoints optimizados** para tablets y móviles
- **Navegación adaptativa** con menú hamburguesa
- **Touch-friendly** con áreas táctiles de 44px mínimo

---

## ⚡ Rendimiento

### Frontend
- **Lazy loading** de componentes
- **Optimización de imágenes**
- **Bundle splitting** automático
- **Service Worker** para PWA

### Backend
- **Connection pooling** en base de datos
- **Compresión gzip**
- **Rate limiting** configurado
- **Logs optimizados** para producción

---

## 🐛 Solución de Problemas

### Error de conexión a base de datos

```bash
# Verificar que PostgreSQL esté ejecutándose
sudo service postgresql status

# Verificar configuración en .env
echo $DB_HOST $DB_PORT $DB_NAME
```

### Error de CORS

Verificar que `REACT_APP_API_URL` apunte a la URL correcta del backend.

### Error de autenticación

Verificar que `JWT_SECRET` esté configurado en ambos entornos.

---

## 📈 Roadmap / Mejoras Futuras

- [ ] **Notificaciones push** para tareas vencidas
- [ ] **Colaboración** entre usuarios
- [ ] **Adjuntos** en tareas
- [ ] **API REST** documentada con Swagger
- [ ] **Tests automatizados** con mayor cobertura
- [ ] **Docker** para desarrollo local
- [ ] **CI/CD** con GitHub Actions

---

## 👨‍💻 Autor

**Jorge Dieste Fuentes**  
📧 Email: [jdieste46@uoc.edu]  
🎓 Trabajo de Fin de Grado - Desarrollo Web - 2025  
🏫 Universitat Oberta de Catalunya (UOC)  
🌐 Aplicación: [https://tfg-gestor-tareas.vercel.app](https://tfg-gestor-tareas.vercel.app)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- Profesorado de la UOC del Grado en Desarrollo Web
- Tutor/a del TFG por la orientación y seguimiento
- Comunidad de desarrolladores de React y Node.js
- Documentación oficial de las tecnologías utilizadas
- Plataformas de despliegue: Vercel y Render

---

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:

1. **Issues**: Abre un issue en GitHub
2. **Email**: Contacta directamente
3. **Documentación**: Revisa este README

---

**⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!**