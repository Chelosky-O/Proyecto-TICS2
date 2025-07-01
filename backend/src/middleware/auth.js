// Protege las rutas con JWT  —  excluye /api/auth/login y /api/health
//
// Usamos express-jwt v7+: la función se expone como .expressjwt
//
const jwt = require('express-jwt').expressjwt;
const { User } = require('../models');

/* capa 1: validar y decodificar JWT */
const jwtMiddleware = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
}).unless({
  path: ['/api/auth/login', '/api/health']
});

/* capa 2: comprobar que el usuario sigue activo */
async function checkActive(req, res, next) {
  // rutas públicas pasan directo
  if (!req.auth) return next();

  try {
    const user = await User.findByPk(req.auth.id);
    if (!user || !user.active) return res.sendStatus(403); // bloqueado
    // opcional: pasar objeto completo al resto de la app
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/* exporta ambas capas como un array (Express lo soporta) */
module.exports = [jwtMiddleware, checkActive];