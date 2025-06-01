module.exports = (sequelize, DataTypes) => {
  // Modelo de Usuario
  const Usuario = sequelize.define('Usuario', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'El email no puede estar vacío'
        },
        isEmail: {
          msg: 'Debe ser un email válido'
        }
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La contraseña no puede estar vacía'
        },
        len: {
          args: [60, 60], // Longitud exacta del hash de bcrypt
          msg: 'El hash de la contraseña debe tener 60 caracteres'
        }
      }
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true, // OPCIONAL
      validate: {
        len: {
          args: [0, 100],
          msg: 'El nombre no puede superar los 100 caracteres'
        }
      }
    }
  });

  // Relación con Tareas
  Usuario.associate = function(models) {
    Usuario.hasMany(models.Tarea, {
      foreignKey: 'usuarioId',
      as: 'tareas'
    });
  };

  return Usuario;
};