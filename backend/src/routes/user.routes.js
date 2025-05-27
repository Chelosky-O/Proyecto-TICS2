// backend/src/routes/user.routes.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');
const rbac = require('../middleware/rbac');

const router = Router();

/* ----------  GET /api/users/me  ---------- */
router.get('/me', async (req, res) => {
  const { id, name, email, area } = req.auth;   // viene del token
  res.json({ id, name, email, area, role: req.auth.role });
});

/* ----- GET /api/users  (lista completa) ----- */
router.get('/', rbac('admin'), async (_, res) => {
  const users = await User.findAll({
    include: { model: Role, attributes: ['name'] },
    attributes: ['id', 'name', 'email', 'area', 'active']
  });
  res.json(users);
});

/* ----- GET /api/users/sg (ejecutores) ----- */
router.get('/sg', rbac('admin'), async (_, res) => {
  const sgRole = await Role.findOne({ where: { name: 'sg' } });
  const execs = await User.findAll({
    where: { RoleId: sgRole.id, active: true },
    attributes: ['id', 'name']
  });
  res.json(execs);
});

/* ----- POST /api/users  (crear) ----- */
router.post('/', rbac('admin'), async (req, res) => {
  const { name, email, password, area, role } = req.body;

  const roleRow = await Role.findOne({ where: { name: role } });
  if (!roleRow) return res.status(400).json({ message: 'Rol inválido' });

  const user = await User.create({
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    area,
    RoleId: roleRow.id
  });

  res.status(201).json({ id: user.id });
});

/* ----- PATCH /api/users/:id/active  (activar / desactivar) ----- */
router.patch('/:id/active', rbac('admin'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).end();

  await user.update({ active: !user.active });
  res.json({ active: user.active });
});

module.exports = router;
