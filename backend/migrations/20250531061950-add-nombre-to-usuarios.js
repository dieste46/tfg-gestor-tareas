'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si la columna ya existe antes de añadirla
    const tableDescription = await queryInterface.describeTable('Usuarios');
    
    if (!tableDescription.nombre) {
      await queryInterface.addColumn('Usuarios', 'nombre', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre opcional del usuario'
      });
      
      console.log('✅ Columna "nombre" añadida a la tabla Usuarios');
    } else {
      console.log('ℹ️  La columna "nombre" ya existe, saltando migración');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Usuarios', 'nombre');
    console.log('✅ Columna "nombre" removida de la tabla Usuarios');
  }
};