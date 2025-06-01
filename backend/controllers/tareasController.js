const { Tarea } = require('../models');

// Este controlador maneja las operaciones CRUD para las tareas de un usuario autenticado.

// Obtener todas las tareas del usuario autenticado
exports.obtenerTareas = async (req, res) => {
  try {
    const tareas = await Tarea.findAll({
      where: { usuarioId: req.user.userId },
      order: [['fecha_limite', 'ASC']]
    });
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
};

// Obtener una tarea específica por ID
exports.crearTarea = async (req, res) => {
  try {
    const { titulo, descripcion, fecha_limite, prioridad } = req.body;
    const tarea = await Tarea.create({
      titulo,
      descripcion,
      fecha_limite,
      prioridad,
      usuarioId: req.user.userId
    });
    res.status(201).json(tarea);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
};

// Actualizar una tarea específica por ID
exports.actualizarTarea = async (req, res) => {
  try {
    const tarea = await Tarea.findOne({
      where: { id: req.params.id, usuarioId: req.user.userId }
    });
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    await tarea.update(req.body);
    res.json(tarea);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
};

// Eliminar una tarea específica por ID
exports.eliminarTarea = async (req, res) => {
  try {
    const tarea = await Tarea.findOne({
      where: { id: req.params.id, usuarioId: req.user.userId }
    });
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    await tarea.destroy();
    res.json({ mensaje: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
};
