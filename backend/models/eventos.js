const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evento = sequelize.define('Evento', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contato: {
    type: DataTypes.STRING,
    allowNull: true
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME
  },
  hora_fim: {
    type: DataTypes.TIME
  },
  local: {
    type: DataTypes.STRING
  },
  ongs: {
    type: DataTypes.STRING
  },
  // --- CAMPO ALTERADO: Continua 'imagem', mas agora é um ARRAY ---
  imagens: { // Continua 'imagem', mas agora armazena um ARRAY de strings
    type: DataTypes.JSONB, // Usando JSONB para armazenar um array de strings
    allowNull: true,
  },
  // -----------------------------------------------------------
  cep: {
      type: DataTypes.STRING(9),
      allowNull: true
    }
}, {
  tableName: 'eventos',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: false
});

module.exports = Evento;