// backend/src/models/user.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('User', {
    name:     { type: DataTypes.STRING,  allowNull: false },
    email:    { type: DataTypes.STRING,  unique: true },
    password: { type: DataTypes.STRING,  allowNull: false }, // hash bcrypt
    area:     { type: DataTypes.STRING },                    // Comercial, SG, etc.
    active:   { type: DataTypes.BOOLEAN, defaultValue: true }
  });
