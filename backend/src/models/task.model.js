const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Task', {
  title:       { type: DataTypes.STRING, allowNull: false },
  type:        { type: DataTypes.ENUM('Retiro','Traslados','Compras','Varios') },
  description: { type: DataTypes.TEXT },
  location:    { type: DataTypes.STRING },
  priority:    { type: DataTypes.ENUM('Alta','Media','Baja'), defaultValue: 'Media' },
  status:      { type: DataTypes.ENUM('Pendiente','En Progreso','Listo'), defaultValue: 'Pendiente' },
  when:        { type: DataTypes.DATE },
});
