// backend/src/routes/calendar.routes.js
const { Router } = require('express');
const { Op } = require('sequelize');
const { Task } = require('../models');
const rbac = require('../middleware/rbac');

const router = Router();

/* ----------  GET /api/calendar  ---------- */
router.get('/', rbac('sg', 'admin'), async (req, res) => {
  const { from, to } = req.query;
  const where = {};

  if (from || to)
    where.dueAt = {
      ...(from && { [Op.gte]: from }),
      ...(to   && { [Op.lte]: to + ' 23:59:59' })
    };

  if (req.auth.role === 'sg')
    where.executorId = req.auth.id;

  const tasks = await Task.findAll({ where });
  res.json(tasks);
});

module.exports = router;
