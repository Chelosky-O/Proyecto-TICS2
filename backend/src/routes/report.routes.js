// backend/src/routes/report.routes.js
const { Router } = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { Task, User } = require('../models');
const rbac = require('../middleware/rbac');

const router = Router();

/* ----------  GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD ---------- */
router.get('/summary', rbac('admin'), async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from || to) where.createdAt = { ...(from && { [Op.gte]: from }), ...(to && { [Op.lte]: to + ' 23:59:59' }) };

  const total      = await Task.count({ where });
  const completed  = await Task.count({ where: { ...where, status: 'Finalizada' } });
  const pending    = await Task.count({ where: { ...where, status: 'Pendiente' } });
  const inProgress = await Task.count({ where: { ...where, status: 'En Progreso' } });

  res.json({ total, completed, pending, inProgress });
});

/* ----------  GET /api/reports/by-area ---------- */
router.get('/by-area', rbac('admin'), async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from || to) where.createdAt = { ...(from && { [Op.gte]: from }), ...(to && { [Op.lte]: to + ' 23:59:59' }) };
  // JOIN con User (author) para obtener área
  const data = await Task.findAll({
    attributes: [
      [literal('author.area'), 'area'],
      [fn('COUNT', col('Task.id')), 'count']
    ],
    include: { model: User, as: 'author', attributes: [] },
    where,
    group: ['author.area']
  });
  res.json(data);
});

/* ----------  GET /api/reports/by-type ---------- */
router.get('/by-type', rbac('admin'), async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from || to) where.createdAt = { ...(from && { [Op.gte]: from }), ...(to && { [Op.lte]: to + ' 23:59:59' }) };
  const data = await Task.findAll({
    attributes: ['type', [fn('COUNT', col('id')), 'count']],
    where,
    group: ['type']
  });
  res.json(data);
});

module.exports = router;
