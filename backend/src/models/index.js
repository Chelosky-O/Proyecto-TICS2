const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: 'mysql' }
);

const Role = require('./role.model')(sequelize);
const User = require('./user.model')(sequelize);
const Task = require('./task.model')(sequelize);

// Relaciones
Role.hasMany(User);
User.belongsTo(Role);

User.hasMany(Task, { as: 'requests', foreignKey: 'authorId' });
Task.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

User.hasMany(Task, { as: 'jobs', foreignKey: 'executorId' });
Task.belongsTo(User, { as: 'executor', foreignKey: 'executorId' });

module.exports = { sequelize, Role, User, Task };
