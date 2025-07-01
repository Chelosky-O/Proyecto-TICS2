// backend/src/routes/task.routes.js
const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { Task, User } = require('../models');
const rbac = require('../middleware/rbac');

/* ─── correo ───────────────────────── */
const sendMail = require('../utils/mailer');
const tpl      = require('../utils/templates');

const router = Router();

/* ----------  Crear tarea  ---------- */
router.post(
  '/',
  rbac('solicitante', 'admin'),
  body('title').notEmpty().withMessage('Título requerido'),
  body('type').isIn(['Retiro', 'Traslados', 'Compras', 'Varios']),
  body('priority').isIn(['Alta', 'Media', 'Baja']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const task = await Task.create({
      ...req.body,
      requestedAt: new Date(),
      authorId: req.auth.id
    });

    /* mail: solicitante + admin 
    await sendMail({
      to: [req.auth.email, process.env.GMAIL_USER],
      ...tpl.newTask(task, req.auth)
    });*/

    res.status(201).json(task);
  }
);

/* ----------  PATCH /tasks/:id/due  ---------- */
router.patch('/:id/due', rbac('solicitante', 'admin'), async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).end();

  if (req.auth.role !== 'admin' && task.authorId !== req.auth.id)
    return res.status(403).end();
  if (task.status !== 'Pendiente')
    return res.status(409).json({ message: 'La tarea ya fue iniciada' });

  await task.update({ dueAt: req.body.dueAt });
  res.json(task);
});

/* ----------  Solicitante: mis tareas ---------- */
router.get('/mine', rbac('solicitante', 'admin'), async (req, res) => {
  const tasks = await Task.findAll({ where: { authorId: req.auth.id } });
  res.json(tasks);
});

/* ----------  SG: asignadas a mí  ---------- */
router.get('/assigned', rbac('sg'), async (req, res) => {
  const tasks = await Task.findAll({
    where: { executorId: req.auth.id },
    include: { model: User, as: 'author', attributes: ['id', 'name', 'area'] }
  });
  res.json(tasks);
});

/* ----------  Admin: todas ---------- */
router.get('/', rbac('admin'), async (_, res) => {
  const tasks = await Task.findAll({
    include: [
      { model: User, as: 'author',   attributes: ['id', 'name', 'area', 'email'] },
      { model: User, as: 'executor', attributes: ['id', 'name', 'email'] }
    ]
  });
  res.json(tasks);
});

/* ----------  Admin: pendientes sin asignar ---------- */
router.get('/unassigned', rbac('admin'), async (_, res) => {
  const tasks = await Task.findAll({
    where: { executorId: null, status: 'Pendiente' }
  });
  res.json(tasks);
});

/* ----------  Admin: asignar ejecutor ---------- */
router.patch('/:id/assign/:userId', rbac('admin'), async (req, res) => {
  const { id, userId } = req.params;
  const task = await Task.findByPk(id, { include: ['author'] });
  if (!task) return res.status(404).end();

  await task.update({ executorId: userId, assignedAt: new Date() });

  const executor = await User.findByPk(userId);

  /* mail: ejecutor + solicitante + admin */
  await sendMail({
    to: [executor.email, task.author.email, process.env.GMAIL_USER],
    ...tpl.assigned(task, executor)
  });

  res.json(task);
});

/* ----------  SG / Admin: cambiar estado ---------- */
router.patch('/:id/status', rbac('sg', 'admin'), async (req, res) => {
  const { status } = req.body;   // 'En Progreso' | 'Finalizada'
  const allowed = ['Pendiente', 'En Progreso', 'Finalizada'];
  if (!allowed.includes(status)) return res.status(400).end();

  const task = await Task.findByPk(req.params.id, { include: ['author'] });
  if (!task) return res.status(404).end();

  /* SG sólo puede modificar sus tareas */
  if (req.auth.role === 'sg' && task.executorId !== req.auth.id)
    return res.status(403).end();

  const canMove =
    (task.status === 'Pendiente'   && status === 'En Progreso') ||
    (task.status === 'En Progreso' && status === 'Finalizada');

  if (!canMove) return res.status(409).json({ message: 'Transición inválida' });

  const updates = { status };
  if (status === 'Finalizada') updates.completedAt = new Date();

  await task.update(updates);

  /* mail: solicitante + admin */
  await sendMail({
    to: [task.author.email, process.env.GMAIL_USER],
    ...tpl.statusChanged(task)
  });

  res.json(task);
});

module.exports = router;
