const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Dono = require('./dono');

const Pet = sequelize.define('Pet', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  raca: DataTypes.STRING,
  idade: DataTypes.INTEGER,
  porte: DataTypes.STRING,
  castrado: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  paraAdocao: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  donoId: {
    type: DataTypes.INTEGER,
    references: {
      model: Dono,
      key: 'id',
    },
    allowNull: false,
  },
});

// Definindo a relação entre Pet e Dono com onDelete: 'CASCADE'
Pet.belongsTo(Dono, { foreignKey: 'donoId', onDelete: 'CASCADE' });
Dono.hasMany(Pet, { foreignKey: 'donoId', onDelete: 'CASCADE' });

module.exports = Pet;
