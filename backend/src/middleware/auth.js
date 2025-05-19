// Protege las rutas con JWT  —  excluye /api/auth/login y /api/health
//
// Usamos express-jwt v7+: la función se expone como .expressjwt
//
const jwt = require('express-jwt').expressjwt;

module.exports = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
}).unless({
  path: [
    '/api/auth/login',
    '/api/health'
  ]
});
