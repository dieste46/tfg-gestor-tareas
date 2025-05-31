require('dotenv').config();
const bcrypt = require('bcrypt');
const { Usuario } = require('./models');

async function crearUsuario() {
  const email = 'admin@uoc.com';
  const password = 'admin123';
  const password_hash = await bcrypt.hash(password, 10);

  try {
    const usuario = await Usuario.create({ email, password_hash });
    console.log('Usuario creado:', usuario.email);
  } catch (error) {
    console.error('Error al crear usuario:', error);
  }
}

crearUsuario();
