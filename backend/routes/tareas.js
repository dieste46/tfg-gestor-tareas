const express = require('express');
const router = express.Router();
const { Tarea } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// Proteger todas las rutas con middleware JWT
router.use(authMiddleware);

// GET: Obtener todas las tareas del usuario autenticado
router.get('/', async (req, res) => {
  try {
    const tareas = await Tarea.findAll({ where: { usuarioId: req.usuario.id } });
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
});

// POST: Crear una nueva tarea
router.post('/', async (req, res) => {
  try {
    const { titulo, descripcion, fecha_limite, prioridad } = req.body;
    const nuevaTarea = await Tarea.create({
      titulo,
      descripcion,
      fecha_limite,
      prioridad,
      completada: false,
      usuarioId: req.usuario.id
    });
    res.status(201).json(nuevaTarea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

// PUT: Editar una tarea
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_limite, prioridad, completada } = req.body;

    const tarea = await Tarea.findOne({ where: { id, usuarioId: req.usuario.id } });
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    tarea.titulo = titulo ?? tarea.titulo;
    tarea.descripcion = descripcion ?? tarea.descripcion;
    tarea.fecha_limite = fecha_limite ?? tarea.fecha_limite;
    tarea.prioridad = prioridad ?? tarea.prioridad;
    tarea.completada = completada ?? tarea.completada;

    await tarea.save();
    res.json(tarea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

// DELETE: Eliminar una tarea
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tarea = await Tarea.findOne({ where: { id, usuarioId: req.usuario.id } });
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    await tarea.destroy();
    res.json({ mensaje: `Tarea con ID ${id} eliminada` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});

module.exports = router;