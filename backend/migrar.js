const { sequelize } = require('./models');

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Migraciones ejecutadas correctamente');
    process.exit();
  })
  .catch((error) => {
    console.error('❌ Error al ejecutar migraciones:', error);
    process.exit(1);
  });
