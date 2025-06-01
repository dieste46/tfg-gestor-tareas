require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Health check y endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Gestor de Tareas API funcionando',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Gestor de Tareas Backend' });
});

// Cargar rutas 
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/tareas', require('./routes/tareas'));
  console.log('✅ Rutas cargadas correctamente');
} catch (error) {
  console.error('❌ Error cargando rutas:', error.message);
}

const PORT = process.env.PORT || 4000;

console.log('🔍 Configuración:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- PORT:', PORT);
console.log('- DATABASE_URL configurada:', !!process.env.DATABASE_URL);

// Arrancar servidor inmediatamente
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  
  // Probar conexión a BD DESPUÉS de arrancar el servidor
  setTimeout(() => {
    try {
      const { sequelize } = require('./models');
      sequelize.authenticate()
        .then(() => {
          console.log('🟢 Conexión con la base de datos establecida');
        })
        .catch((err) => {
          console.error('🔴 Error de conexión BD (no crítico):', err.message);
        });
    } catch (error) {
      console.error('🔴 Error cargando modelos (no crítico):', error.message);
    }
  }, 1000);
});