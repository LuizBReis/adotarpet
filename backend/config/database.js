const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('petmatch', 'postgres', 'banana', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = sequelize;
