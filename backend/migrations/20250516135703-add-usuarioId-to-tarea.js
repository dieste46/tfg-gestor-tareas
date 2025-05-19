'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Tareas', 'usuarioId', {
      type: Sequelize.INTEGER,
      allowNull: true, // O false si ya controlaste los datos existentes
      references: {
        model: 'Usuarios',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tareas', 'usuarioId');
  }
};
// Este archivo es una migración para agregar la columna usuarioId a la tabla Tareas