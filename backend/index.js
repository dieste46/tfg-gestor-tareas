require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const tareasRoutes = require('./routes/tareas');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/tareas', tareasRoutes);

// Sincronizar la base de datos y arrancar el servidor
sequelize.sync()
  .then(() => {
    console.log('Base de datos sincronizada');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
  });
