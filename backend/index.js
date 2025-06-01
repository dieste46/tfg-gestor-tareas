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
    // Permitir dominios de Vercel y localhost en desarrollo
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (process.env.NODE_ENV !== 'production' && origin && origin.includes('localhost')) {
      return callback(null, true);
    }
    // Verificar si el origen está en la lista de permitidos
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
  
  // 🔍 Debug completo de configuración
  console.log('🔍 Variables BD completas:', {
    hasDbUrl: !!process.env.DATABASE_URL,
    hasIndividualVars: !!(process.env.DB_HOST && process.env.DB_USERNAME),
    dbHost: process.env.DB_HOST || 'No configurado',
    dbPort: process.env.DB_PORT || 'No configurado',
    dbName: process.env.DB_NAME || 'No configurado',
    dbUsername: process.env.DB_USERNAME ? 'Configurado' : 'No configurado',
    dbPassword: process.env.DB_PASSWORD ? 'Configurado' : 'No configurado',
    dbDialect: process.env.DB_DIALECT || 'No configurado'
  });
});

// 🔍 Test de conexión directa con pg
const testDirectConnection = async () => {
  console.log('🧪 Probando conexión DIRECTA con pg...');
  
  try {
    const { Client } = require('pg');
    
    const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    });
    // Mostrar configuración de conexión
    console.log('🔍 Configuración pg directa:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD ? '****' : 'NO CONFIGURADO'
    });
    // Conectar al cliente pg
    await client.connect();
    console.log('✅ Conexión DIRECTA con pg exitosa!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query test exitosa:', result.rows[0]);
    
    await client.end();
    
  // Manejo de errores
  } catch (error) {
    console.log('❌ Error en conexión directa pg:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      hostname: error.hostname,
      host: error.host,
      port: error.port,
      address: error.address,
      name: error.name,
      stack: error.stack ? error.stack.split('\n').slice(0, 3) : 'Sin stack'
    });
  }
};

// Conexión a BD con Sequelize + test directo
const connectDatabase = async () => {
  try {
    console.log('🔄 Intentando conectar a la base de datos...');
    
    // 🧪 Primero probar conexión directa
    await testDirectConnection();
    
    console.log('🔄 Ahora probando con Sequelize...');
    
    let retries = 1; // Solo 1 intento para no saturar logs
    while (retries > 0) {
      try {
        await sequelize.authenticate();
        console.log('🟢 Conexión con la base de datos establecida exitosamente');
        
        if (process.env.NODE_ENV !== 'production') {
          await sequelize.sync();
          console.log('🔄 Modelos sincronizados');
        }
        
        return;
      } catch (error) {
        retries--;
        console.log(`❌ Error conectando a BD con Sequelize. Reintentos restantes: ${retries}`);
        
        // 🔍 Análisis PROFUNDO del error
        console.log('🔍 ERROR COMPLETO JSON:', JSON.stringify(error, null, 2));
        
        // Recorrer todos los niveles del error
        let currentError = error;
        let level = 0;
        
        while (currentError && level < 5) {
          console.log(`🔍 Error nivel ${level}:`, {
            constructor: currentError.constructor.name,
            name: currentError.name,
            message: currentError.message,
            code: currentError.code,
            errno: currentError.errno,
            syscall: currentError.syscall,
            hostname: currentError.hostname,
            host: currentError.host,
            port: currentError.port,
            address: currentError.address,
            hasOriginal: !!currentError.original,
            hasParent: !!currentError.parent,
            hasCause: !!currentError.cause,
            hasErrors: !!currentError.errors
          });
          
          // Buscar el siguiente nivel
          currentError = currentError.original || currentError.parent || currentError.cause || 
                        (currentError.errors && currentError.errors[0]);
          level++;
        }
        
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    console.error('🔴 No se pudo conectar a la base de datos');
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