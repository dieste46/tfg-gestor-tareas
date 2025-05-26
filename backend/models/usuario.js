module.exports = (sequelize, DataTypes) => {
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
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'El nombre no puede superar los 100 caracteres'
        }
      }
    }
  });

  // Opcional: métodos personalizados o relaciones
  // Usuario.associate = function(models) {
  //   // Relación con otras tablas si las hubiera
  // };

  return Usuario;
};
