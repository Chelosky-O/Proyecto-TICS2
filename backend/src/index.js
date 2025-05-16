require('dotenv').config();                // lee backend/.env + variables de Docker
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors()).use(express.json());

// 1. Conexión a MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: 'mysql' }
);

// 2. Modelo de ejemplo
const Task = sequelize.define('Task', {
  title:       { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT }
});

// 3. Sincroniza tablas en dev
(async () => {
  try {
    await sequelize.authenticate();
    console.log('🎉 MySQL conectado');
    await sequelize.sync();               // crea tabla si no existe
  } catch (err) {
    console.error('❌ Error de BDD:', err);
  }
})();

// 4. Rutas
app.get('/api/health', (_, res) => res.json({ ok: true }));

app.get('/api/tasks', async (_, res) => {
  const tasks = await Task.findAll();
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const task = await Task.create(req.body);
  res.status(201).json(task);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API http://localhost:${PORT}`));
