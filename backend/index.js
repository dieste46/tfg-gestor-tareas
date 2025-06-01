require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check endpoints para Render
app.get('/', (req, res) => {
  res.json({ 
    message: 'Gestor de Tareas API funcionando',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Gestor de Tareas Backend' });
});

// Rutas principales
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tareas', require('./routes/tareas'));

// Conexión a la base de datos y arranque del servidor
const PORT = process.env.PORT || 4000;

console.log('🔍 Configuración:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', PORT);
console.log('- DATABASE_URL configurada:', !!process.env.DATABASE_URL);

sequelize.authenticate()
  .then(() => {
    console.log('🟢 Conexión con la base de datos establecida.');
    
    // Solo sync en desarrollo, en producción saltar
    if (process.env.NODE_ENV !== 'production') {
      return sequelize.sync({ alter: true });
    } else {
      console.log('📋 Modo producción: usando BD existente');
      return Promise.resolve();
    }
  })
  .then(() => {
    console.log('✅ Base de datos lista');
    
    // Render automáticamente detecta el puerto
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error('🔴 Error:', err.message);
    
    // Arrancar servidor aunque falle la BD
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT} (con errores de BD)`);
    });
  });