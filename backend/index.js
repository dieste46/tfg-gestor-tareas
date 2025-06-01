require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
    ];
    
    // Permitir todos los dominios .vercel.app
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Desarrollo local
    if (process.env.NODE_ENV !== 'production' && origin && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS bloqueado para:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: sequelize ? 'Configured' : 'Not configured'
  });
});

// Middleware de debug temporal
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tareas', require('./routes/tareas'));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({ 
    error: 'Error interno del servidor'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor PRIMERO, BD después
const PORT = process.env.PORT || 4000;

// Iniciar servidor inmediatamente
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Debug de configuración BD
  console.log('🔍 Variables BD:', {
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPreview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'No disponible',
    hasIndividualVars: !!(process.env.DB_HOST && process.env.DB_USERNAME),
    host: process.env.DB_HOST || 'No configurado'
  });
});

// Conectar a BD después (sin bloquear el servidor)
const connectDatabase = async () => {
  try {
    console.log('🔄 Intentando conectar a la base de datos...');
    
    let retries = 3;
    while (retries > 0) {
      try {
        await sequelize.authenticate();
        console.log('🟢 Conexión con la base de datos establecida exitosamente');
        
        // Sincronizar modelos solo en desarrollo
        if (process.env.NODE_ENV !== 'production') {
          await sequelize.sync();
          console.log('🔄 Modelos sincronizados');
        }
        
        return; // Salir del bucle si la conexión es exitosa
      } catch (error) {
        retries--;
        console.log(`❌ Error conectando a BD. Reintentos restantes: ${retries}`);
        console.log('Detalle del error:', error.message);
        
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    // la conexión falló después de todos los intentos
    console.error('🔴 No se pudo conectar a la base de datos después de 3 intentos');
    console.error('⚠️  El servidor funcionará sin BD (algunos endpoints fallarán)');
    
  } catch (err) {
    console.error('🔴 Error general conectando BD:', err.message);
  }
};

// Conectar a BD de forma asíncrona (no bloquear servidor)
connectDatabase();

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    sequelize.close().then(() => {
      console.log('✅ Conexión BD cerrada');
      process.exit(0);
    });
  });
});

// Para debugs adicionales
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err.message);
  // NO hacer process.exit en producción
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  // NO hacer process.exit en producción
});

module.exports = app;