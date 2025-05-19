require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Aquí importamos las rutas de autenticación
const tareasRoutes = require('./routes/tareas'); // Aquí importamos las rutas agrupadas

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes) // habilitamos las rutas de autenticación

// Agrupamos todas las rutas de tareas bajo /api/tareas
app.use('/api/tareas', tareasRoutes);

// Sincronizamos la base de datos
const { sequelize } = require('./models');

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Migraciones ejecutadas correctamente');
    process.exit();
  })
  .catch((error) => {
    console.error('❌ Error al ejecutar migraciones:', error);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
