const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      error: firstError.msg
    });
  }
  next();
};

// Ruta de login
router.post('/login', [
  check('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  check('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
], handleValidationErrors, authController.login);

// Ruta de registro  
router.post('/registro', [
  check('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    // Quitamos la validación de letra+número para simplificar
], handleValidationErrors, authController.registro);

module.exports = router;