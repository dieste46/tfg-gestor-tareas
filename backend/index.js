require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tareas', require('./routes/tareas'));

// Conexión a la base de datos y arranque del servidor
const PORT = process.env.PORT || 4000;

sequelize.authenticate()
  .then(() => {
    console.log('🟢 Conexión con la base de datos establecida.');

    return sequelize.sync({alter: true}); // Puedes usar { force: false } o { alter: true } si estás desarrollando
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('🔴 Error al conectar con la base de datos:', err);
  });
