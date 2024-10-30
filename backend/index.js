const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Carrega variáveis do .env
const sequelize = require('./config/database');
const donoRoutes = require('./routes/donoRoutes');
const petRoutes = require('./routes/petRoutes');
// const registerRoute = require('./routes/register');
const authRoutes = require('./routes/authRoutes'); // Importei o authRoutes

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/api/donos', donoRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/auth', authRoutes); // Adicionei a rota de autenticação

sequelize.sync({ force: true }).then(() => {
  app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
  });
}).catch(err => {
  console.error('Erro ao sincronizar o banco de dados:', err);
});
