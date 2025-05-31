const pool = require('../config/database');

async function up() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Añadir la columna nombre si no existe
    await client.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS nombre VARCHAR(100);
    `);
    
    await client.query('COMMIT');
    console.log('✅ Migración 002: Columna "nombre" añadida correctamente');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en migración 002:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up };