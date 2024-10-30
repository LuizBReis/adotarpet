const express = require('express');
const Dono = require('../models/dono');
const router = express.Router();

// Criar Dono
router.post('/', async (req, res) => {
  try {
    const dono = await Dono.create(req.body);
    res.status(201).json(dono);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obter todos os Donos
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
