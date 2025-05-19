const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Role', {
  name: { type: DataTypes.STRING, unique: true }
}, { timestamps: false });
