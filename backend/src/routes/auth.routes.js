// backend/src/routes/auth.routes.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const router = Router();

/* ----------  POST /api/auth/login  ---------- */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // trae también el rol
  const user = await User.findOne({ where: { email }, include: Role });

  // ① usuario existe, ② contraseña ok, ③ está activo
  if (
    !user ||
    !user.active ||
    !bcrypt.compareSync(password, user.password)
  )
    return res
      .status(401)
      .json({ message: 'Credenciales inválidas o usuario inactivo' });

  /*  payload con datos que necesita el FE */
  const token = jwt.sign(
    {
      id:   user.id,
      name: user.name,
      email: user.email,
      role: user.Role.name, // 'admin' | 'sg' | 'solicitante'
      area: user.area
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.Role.name, area: user.area }
  });
});

module.exports = router;