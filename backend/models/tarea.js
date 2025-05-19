'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tarea extends Model {
    static associate(models) {
      Tarea.belongsTo(models.Usuario, {
        foreignKey: 'usuarioId',
        onDelete: 'CASCADE'
      });
    }
  }

  Tarea.init({
    titulo: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    fecha_limite: DataTypes.DATE,
    prioridad: DataTypes.STRING,
    completada: DataTypes.BOOLEAN,
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Tarea',
  });

  return Tarea;
};
