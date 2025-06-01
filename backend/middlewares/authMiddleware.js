// Middleware para autenticar solicitudes usando JWT
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
// Verificar que el header Authorization esté presente y tenga el formato correcto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado o mal formado' });
  }
// Extraer el token del header Authorization
  const token = authHeader.split(' ')[1];

  try {
    // Verificar y decodificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // userId y email si los pusiste en el token
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = authenticateToken;
