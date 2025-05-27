// backend/src/routes/task.routes.js
const { Router } = require('express');
const { body, validationResult } = require('express-validator'); // 👈 import correcto
const { Task, User } = require('../models');
const rbac = require('../middleware/rbac');

const router = Router();

/* ----------  Crear tarea  ---------- */
router.post(
  '/',
  rbac('solicitante', 'admin'),
  // Validaciones
  body('title').notEmpty().withMessage('Título requerido'),
  body('type').isIn(['Retiro', 'Traslados', 'Compras', 'Varios']),
  body('priority').isIn(['Alta', 'Media', 'Baja']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    const task = await Task.create({
      ...req.body,
      requestedAt: new Date(),
      authorId: req.auth.id
    });
    res.status(201).json(task);
  }
);

/* ----------  PATCH /api/tasks/:id/due  (planificar) ---------- */
router.patch('/:id/due', rbac('solicitante', 'admin'), async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).end();

  // Sólo el autor o el admin pueden planificar mientras está Pendiente
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
      { model: User, as: 'author',   attributes: ['id', 'name', 'area'] },
      { model: User, as: 'executor', attributes: ['id', 'name'] }
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

/* ----------  Admin: asignar ---------- */
router.patch('/:id/assign/:userId', rbac('admin'), async (req, res) => {
  const { id, userId } = req.params;
  const task = await Task.findByPk(id);
  if (!task) return res.status(404).end();
  await task.update({ executorId: userId, assignedAt: new Date() });
  res.json(task);
});

/* ----------  SG: cambiar estado  ---------- */
router.patch('/:id/status', rbac('sg'), async (req, res) => {
  const { status } = req.body;                           // 'En Progreso' | 'Listo'
  const allowed = ['Pendiente', 'En Progreso', 'Listo'];
  if (!allowed.includes(status)) return res.status(400).end();

  const task = await Task.findByPk(req.params.id);
  if (!task || task.executorId !== req.auth.id) return res.status(403).end();

  // Reglas simples de transición
  const canMove =
    (task.status === 'Pendiente'   && status === 'En Progreso') ||
    (task.status === 'En Progreso' && status === 'Listo');

  if (!canMove) return res.status(409).json({ message: 'Transición inválida' });

  const updates = { status };
  if (status === 'Listo') updates.completedAt = new Date();
  
  await task.update({ updates });
  res.json(task);
});

module.exports = router;
