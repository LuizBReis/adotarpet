const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Dono = sequelize.define('Dono', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^\d{2}\d{4,5}\d{4}$/, // Validação para aceitar apenas números brasileiros
      len: [10, 11], // Número deve ter entre 10 e 11 dígitos
    },
  },
  
  rua: DataTypes.STRING,
  cidade: DataTypes.STRING,
  estado: DataTypes.STRING,
  cep: DataTypes.STRING,
  latitude: DataTypes.DECIMAL(9, 6),
  longitude: DataTypes.DECIMAL(9, 6),
});

Dono.beforeCreate(async (dono) => {
  if (dono.senha) {
    dono.senha = await bcrypt.hash(dono.senha, 10);
  }
});

Dono.prototype.compareSenha = function (senha) {
  return bcrypt.compare(senha, this.senha);
};

Dono.prototype.generateToken = function () {
  return jwt.sign({ id: this.id, email: this.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = Dono;
