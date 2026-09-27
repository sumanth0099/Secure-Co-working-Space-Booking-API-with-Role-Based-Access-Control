const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Workspace = sequelize.define('Workspace', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['DESK', 'MEETING_ROOM']],
    },
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  }
}, {
  tableName: 'workspaces',
  timestamps: false
});

module.exports = Workspace;
