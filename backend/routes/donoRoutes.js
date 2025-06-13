const express = require('express');
const Dono = require('../models/dono');
const router = express.Router();
// Importe o Op do sequelize para usar os operadores de consulta
const { Op } = require('sequelize'); // Adicione esta linha


// Criar Dono (AGORA COM VALIDAÇÃO DE UNICIDADE PARA EMAIL E TELEFONE)
router.post('/', async (req, res) => {
  try {
    const { nome, email, senha, telefone, rua, cidade, estado, cep, latitude, longitude } = req.body;

    // 1. Verificar se o Email já está cadastrado
    const existingDonoByEmail = await Dono.findOne({ where: { email } });
    if (existingDonoByEmail) {
      return res.status(400).json({ error: 'EMAIL JÁ CADASTRADO. Por favor, use outro e-mail.' });
    }

    // 2. Verificar se o Telefone já está cadastrado
    const existingDonoByTelefone = await Dono.findOne({ where: { telefone } });
    if (existingDonoByTelefone) {
      return res.status(400).json({ error: 'TELEFONE JÁ CADASTRADO. Por favor, use outro número de telefone.' });
    }

    // Se ambos email e telefone são únicos, procede com o registro
    const dono = await Dono.create(req.body); // O req.body já deve conter todos os campos
    res.status(201).json(dono);
  } catch (error) {
    // Este catch pegará QUALQUER outro erro que não seja de unicidade de email ou telefone já verificados.
    // Por exemplo, erro de validação de formato, ou algum erro de banco de dados inesperado.
    res.status(400).json({ error: error.message || 'Erro desconhecido ao registrar usuário.' });
    console.error('Erro detalhado no registro:', error); // Log para depuração
  }
});

// Obter todos os Donos
// NOTE: Esta rota ainda não está protegida por auth/authorize, mas deve ser para o admin.
// Se você quiser protegê-la, precisará importar 'auth' e 'authorize' aqui e adicioná-los.
router.get('/', async (req, res) => {
  try {
    const donos = await Dono.findAll();
    res.json(donos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obter um Dono por ID
router.get('/:id', async (req, res) => {
  try {
    const dono = await Dono.findByPk(req.params.id);
    if (dono) {
      res.json(dono);
    } else {
      res.status(404).json({ error: 'Dono não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar Dono
router.put('/:id', async (req, res) => {
  try {
    const dono = await Dono.findByPk(req.params.id);
    if (dono) {
      await dono.update(req.body);
      res.json(dono);
    } else {
      res.status(404).json({ error: 'Dono não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar Dono
router.delete('/:id', async (req, res) => {
  console.log('Requisição DELETE recebida para ID:', req.params.id);
  try {
    const dono = await Dono.findByPk(req.params.id);
    if (dono) {
      await dono.destroy();
      res.json({ message: 'Dono deletado' });
    } else {
      console.log('Dono não encontrado para ID:', req.params.id);
      res.status(404).json({ error: 'Dono não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar dono:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;