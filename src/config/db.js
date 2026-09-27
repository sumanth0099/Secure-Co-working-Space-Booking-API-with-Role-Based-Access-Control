const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/coworking_db', {
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
