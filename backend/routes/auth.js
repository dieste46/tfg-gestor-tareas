const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Usuario } = require('../models');



router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      'secretoJWT',
      { expiresIn: '1h' }
    );

    res.json({ token, nombre: usuario.nombre || email });
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ error: 'Error en login' });
  }
});
router.post('/registro', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validar que el email no exista ya
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Cifrar la contraseña
    const bcrypt = require('bcrypt');
    const password_hash = await bcrypt.hash(password, 10);

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({ email, password_hash });

    res.status(201).json({ mensaje: 'Usuario creado correctamente', email: nuevoUsuario.email });
  } catch (error) {
    console.error('Error en /registro:', error);
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  }
});


module.exports = router;
