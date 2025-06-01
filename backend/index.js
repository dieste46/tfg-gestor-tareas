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
    
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: sequelize ? 'Configured' : 'Not configured'
  });
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Rutas
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/tareas', require('./routes/tareas'));
  console.log('✅ Rutas cargadas exitosamente');
} catch (error) {
  console.error('❌ Error cargando rutas:', error.message);
}

// Error handling
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

// Iniciar servidor
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Debug de DATABASE_URL
  console.log('🔍 Variables BD:', {
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPreview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'No disponible',
    hasIndividualVars: !!(process.env.DB_HOST && process.env.DB_USERNAME),
    host: process.env.DB_HOST || 'No configurado',
    dbUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    dbUrlContainsFrankfurt: process.env.DATABASE_URL ? process.env.DATABASE_URL.includes('frankfurt') : false
  });
});

// 🔍 Conexión a BD con captura del error ORIGINAL
const connectDatabase = async () => {
  try {
    console.log('🔄 Intentando conectar a la base de datos...');
    console.log('🔍 DATABASE_URL configurada:', !!process.env.DATABASE_URL);
    
    let retries = 3;
    while (retries > 0) {
      try {
        // 🆕 Capturar error original directamente del cliente PostgreSQL
        await sequelize.authenticate();
        console.log('🟢 Conexión con la base de datos establecida exitosamente');
        
        if (process.env.NODE_ENV !== 'production') {
          await sequelize.sync();
          console.log('🔄 Modelos sincronizados');
        }
        
        return;
      } catch (error) {
        retries--;
        console.log(`❌ Error conectando a BD. Reintentos restantes: ${retries}`);
        
        // 🆕 Buscar el error original anidado
        let originalError = error;
        
        // Sequelize anida errores
        if (error.original) originalError = error.original;
        if (error.parent) originalError = error.parent;
        if (error.cause) originalError = error.cause;
        
        console.log('🔍 Error Sequelize completo:', {
          name: error.name,
          message: error.message,
          sql: error.sql || 'No SQL',
          original: error.original ? 'Sí tiene original' : 'No tiene original',
          parent: error.parent ? 'Sí tiene parent' : 'No tiene parent'
        });
        
        console.log('🔍 Error ORIGINAL completo:', {
          message: originalError.message || 'Sin mensaje',
          code: originalError.code || 'Sin código',
          errno: originalError.errno || 'Sin errno',
          syscall: originalError.syscall || 'Sin syscall',
          hostname: originalError.hostname || 'Sin hostname',
          host: originalError.host || 'Sin host',
          port: originalError.port || 'Sin puerto',
          address: originalError.address || 'Sin address',
          name: originalError.name || 'Sin nombre',
          stack: originalError.stack ? originalError.stack.split('\n')[0] : 'Sin stack'
        });
        
        // 🆕 También intentar acceder a propiedades del error pg
        if (originalError.routine) {
          console.log('🔍 Error PostgreSQL:', {
            routine: originalError.routine,
            file: originalError.file,
            line: originalError.line,
            detail: originalError.detail
          });
        }
        
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    console.error('🔴 No se pudo conectar a la base de datos después de 3 intentos');
    console.error('⚠️  El servidor funcionará sin BD (algunos endpoints fallarán)');
    
  } catch (err) {
    console.error('🔴 Error general conectando BD:', err);
  }
};

connectDatabase();

// Graceful shutdown
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

process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;