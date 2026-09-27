const User = require('./User');
const Workspace = require('./Workspace');
const Booking = require('./Booking');
const sequelize = require('../config/db');

module.exports = {
  User,
  Workspace,
  Booking,
  sequelize
};
