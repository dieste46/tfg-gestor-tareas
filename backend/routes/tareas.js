const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const { check, validationResult } = require('express-validator');
const tareasCtrl = require('../controllers/tareasController');

router.use(authenticateToken);

router.get('/', tareasCtrl.obtenerTareas);

router.post('/', [
  check('titulo').notEmpty().withMessage('El título es obligatorio'),
  check('prioridad').isIn(['baja', 'media', 'alta']).withMessage('Prioridad inválida'),
  check('fecha_limite').optional().isISO8601().withMessage('Fecha no válida')
], (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });
  tareasCtrl.crearTarea(req, res);
});

router.put('/:id', [
  check('titulo').optional().notEmpty(),
  check('prioridad').optional().isIn(['baja', 'media', 'alta']),
  check('fecha_limite').optional().isISO8601(),
  check('completada').optional().isBoolean()
], (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });
  tareasCtrl.actualizarTarea(req, res);
});

router.delete('/:id', tareasCtrl.eliminarTarea);

module.exports = router;
