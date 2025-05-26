

module.exports = (sequelize, DataTypes) => {
  const Tarea = sequelize.define('Tarea', {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El título no puede estar vacío'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_limite: {
      type: DataTypes.DATE,
      allowNull: true
    },
    prioridad: {
      type: DataTypes.ENUM('baja', 'media', 'alta'),
      allowNull: false,
      defaultValue: 'media'
    },
    completada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  // Relación con Usuario
  Tarea.associate = (models) => {
    Tarea.belongsTo(models.Usuario, {
      foreignKey: {
        name: 'usuarioId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return Tarea;
};
// Este modelo define una tarea con los campos necesarios y una relación con el modelo Usuario.