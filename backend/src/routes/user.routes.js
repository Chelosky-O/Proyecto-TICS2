// backend/src/routes/user.routes.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User, Role } = require('../models');
const rbac = require('../middleware/rbac');

const router = Router();

/* ---------- GET /api/users/me ---------- */
router.get('/me', async (req, res) => {
  const { id, name, email, area, role } = req.auth;
  res.json({ id, name, email, area, role });
});

/* ---------- PATCH /api/users/me  (editar perfil propio) ---------- */
router.patch(
  '/me',
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('area').optional(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const user = await User.findByPk(req.auth.id);
    if (!user) return res.status(404).end();

    await user.update(req.body);
    res.json({ id: user.id, name: user.name, email: user.email, area: user.area });
  }
);

/* ---------- PATCH /api/users/me/password  (cambiar contraseña) ---------- */
router.patch(
  '/me/password',
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 3 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const user = await User.findByPk(req.auth.id);
    if (!user) return res.status(404).end();

    // Verificar contraseña actual
    const isValidPassword = bcrypt.compareSync(req.body.currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isSamePassword = bcrypt.compareSync(req.body.newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'La nueva contraseña debe ser diferente a la contraseña actual' });
    }

    // Actualizar contraseña
    await user.update({ password: bcrypt.hashSync(req.body.newPassword, 10) });
    res.json({ message: 'Contraseña actualizada exitosamente' });
  }
);

/* ---------- GET /api/users ---------- */
router.get('/', rbac('admin'), async (_, res) => {
  const users = await User.findAll({
    include: { model: Role, attributes: ['name'] },
    attributes: ['id', 'name', 'email', 'area', 'active']
  });
  res.json(users);
});

/* ---------- GET /api/users/sg ---------- */
router.get('/sg', rbac('admin'), async (_, res) => {
  const sgRole = await Role.findOne({ where: { name: 'sg' } });
  const execs = await User.findAll({
    where: { RoleId: sgRole.id, active: true },
    attributes: ['id', 'name']
  });
  res.json(execs);
});

/* ---------- POST /api/users  (crear) ---------- */
router.post(
  '/',
  rbac('admin'),
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 3 }),
  body('role').isIn(['admin', 'sg', 'solicitante']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { name, email, password, area, role } = req.body;
    const roleRow = await Role.findOne({ where: { name: role } });

    const user = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      area,
      RoleId: roleRow.id
    });
    res.status(201).json({ id: user.id });
  }
);

/* ---------- PATCH /api/users/:id  (editar datos) ---------- */
router.patch(
  '/:id',
  rbac('admin'),
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('area').optional(),
  body('role').optional().isIn(['admin', 'sg', 'solicitante']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).end();

    // proteger al propio admin
    if (user.id === req.auth.id && req.body.role && req.body.role !== 'admin')
      return res.status(409).json({ message: 'No puedes cambiar tu propio rol' });

    if (req.body.role) {
      const newRole = await Role.findOne({ where: { name: req.body.role } });
      req.body.RoleId = newRole.id;
      delete req.body.role;
    }

    await user.update(req.body);
    res.json(user);
  }
);

/* ---------- PATCH /api/users/:id/active  ---------- */
router.patch('/:id/active', rbac('admin'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).end();
  if (user.id === req.auth.id)
    return res.status(409).json({ message: 'No puedes desactivar tu propia cuenta' });

  await user.update({ active: !user.active });
  res.json({ id: user.id, active: user.active });
});

/* ---------- DELETE /api/users/:id ---------- */
router.delete('/:id', rbac('admin'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).end();
  if (user.id === req.auth.id)
    return res.status(409).json({ message: 'No puedes eliminar tu propia cuenta' });

  await user.destroy();              // eliminación física
  res.sendStatus(204);
});

module.exports = router;
