const express = require('express');
const Pet = require('../models/pet');
const router = express.Router();

// Criar Pet
router.post('/', async (req, res) => {
  try {
    const { donoId, nome, idade, tipo, raca, castrado, porte, paraAdocao } = req.body;
    if (!donoId) {
      return res.status(400).json({ error: 'ID do dono é obrigatório' });
    }
    const pet = await Pet.create({ donoId, nome, idade, tipo, raca, castrado, porte, paraAdocao });
    res.status(201).json(pet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obter todos os Pets
router.get('/', async (req, res) => {
  try {
    const pets = await Pet.findAll();
    res.json(pets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obter todos os Pets de um Dono específico
router.get('/dono/:donoId', async (req, res) => {
  try {
    const donoId = req.params.donoId;
    console.log(`Buscando pets para o dono ID: ${donoId}`); // Log para depuração
    const pets = await Pet.findAll({ where: { donoId } });
    res.json(pets);
  } catch (error) {
    console.error(error); // Log do erro
    res.status(400).json({ error: error.message });
  }
});

// Obter pets disponíveis para adoção
router.get('/adocao', async (req, res) => {
  try {
    const pets = await Pet.findAll({ where: { paraAdocao: true } });
    res.json(pets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obter um Pet pelo ID
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (pet) {
      res.json(pet);
    } else {
      res.status(404).json({ error: 'Pet não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar Pet
router.put('/:id', async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (pet) {
      await pet.update(req.body);
      res.json(pet);
    } else {
      res.status(404).json({ error: 'Pet não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar Pet
router.delete('/:id', async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (pet) {
      await pet.destroy();
      res.json({ message: 'Pet deletado' });
    } else {
      res.status(404).json({ error: 'Pet não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
