const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ✅ MEJORADO - Fallar si no existe JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET es requerido en variables de entorno');
}

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const usuario = await Usuario.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const esValido = await bcrypt.compare(password, usuario.password_hash);
    if (!esValido) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: usuario.id, 
        email: usuario.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // ✅ Log seguro - no incluir datos sensibles
    console.log(`Login exitoso: ${usuario.email} - ${new Date().toISOString()}`);

    // Respuesta exitosa
    res.json({
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre
      }
    });

  } catch (error) {
    console.error('Error en login:', error.message); // ✅ Solo el mensaje, no el stack completo
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

// REGISTRO
exports.registro = async (req, res) => {
  const { email, password, nombre } = req.body;

  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      where: { email: email.toLowerCase() }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        error: 'Ya existe una cuenta con este email'
      });
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      email: email.toLowerCase(),
      password_hash,
      nombre: nombre?.trim() || null
    });

    // ✅ Log seguro
    console.log(`Usuario registrado: ${nuevoUsuario.email} - ${new Date().toISOString()}`);

    // Respuesta exitosa
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre
      }
    });

  } catch (error) {
    console.error('Error en registro:', error.message);

    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Datos de registro inválidos'
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Ya existe una cuenta con este email'
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};