const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Workspace = require('./Workspace');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  workspace_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Workspace,
      key: 'id'
    }
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'CONFIRMED'
  }
}, {
  tableName: 'bookings',
  timestamps: false
});

Booking.belongsTo(User, { foreignKey: 'user_id' });
Booking.belongsTo(Workspace, { foreignKey: 'workspace_id' });
User.hasMany(Booking, { foreignKey: 'user_id' });
Workspace.hasMany(Booking, { foreignKey: 'workspace_id' });

module.exports = Booking;
