const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    const esValido = await bcrypt.compare(password, usuario.password_hash);
    if (!esValido) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, nombre: usuario.nombre || usuario.email });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno en login' });
  }
};

// REGISTRO
exports.registro = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const nuevoUsuario = await Usuario.create({ email, password_hash });

    res.status(201).json({ mensaje: 'Usuario creado correctamente', email: nuevoUsuario.email });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  }
};
// Middleware para verificar si el usuario está autenticado
