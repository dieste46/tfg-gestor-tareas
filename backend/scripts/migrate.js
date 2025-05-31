const { up } = require('../migrations/002_add_nombre_column');

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración 002: Añadir campo nombre...');
    await up();
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };