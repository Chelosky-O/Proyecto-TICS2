// backend/src/routes/auth.routes.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const router = Router();

/* ----------  POST /api/auth/login  ---------- */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email }, include: Role });
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: 'Credenciales inválidas' });

  /*  Payload con name, role & area — el FE lo necesita */
  const token = jwt.sign(
    {
      id:   user.id,
      name: user.name,
      role: user.Role.name,   // 'admin' | 'sg' | 'solicitante'
      area: user.area
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, role: user.Role.name, area: user.area }
  });
});

module.exports = router;
