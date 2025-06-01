const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const { check, validationResult } = require('express-validator');
const tareasCtrl = require('../controllers/tareasController');

// Middleware para autenticar el token JWT
router.use(authenticateToken);

// Rutas de tareas
router.get('/', tareasCtrl.obtenerTareas);

// Ruta para obtener una tarea por ID
router.post('/', [
  check('titulo').notEmpty().withMessage('El título es obligatorio'),
  check('prioridad').isIn(['baja', 'media', 'alta']).withMessage('Prioridad inválida'),
  check('fecha_limite').optional().isISO8601().withMessage('Fecha no válida')
], (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });
  tareasCtrl.crearTarea(req, res);
});

// Ruta para actualizar una tarea por ID
router.put('/:id', [
  // Validaciones opcionales para actualizar tarea
  check('titulo').optional().notEmpty(),
  check('prioridad').optional().isIn(['baja', 'media', 'alta']),
  check('fecha_limite').optional().isISO8601(),
  check('completada').optional().isBoolean()
], (req, res) => {
  const errores = validationResult(req);
  // Validar que haya errores
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });
  // Validar que la tarea existe
  tareasCtrl.actualizarTarea(req, res);
});
// Ruta para eliminar una tarea por ID
router.delete('/:id', tareasCtrl.eliminarTarea);

module.exports = router;

