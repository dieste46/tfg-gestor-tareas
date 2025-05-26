const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

// Ruta de login
router.post('/login', [
  check('email').isEmail().withMessage('Email inválido'),
  check('password').notEmpty().withMessage('La contraseña es obligatoria')
], (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  authController.login(req, res);
});

// Ruta de registro
router.post('/registro', [
  check('email').isEmail().withMessage('Email inválido'),
  check('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/\d/).withMessage('Debe contener al menos un número')
], (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  authController.registro(req, res);
});

module.exports = router;
