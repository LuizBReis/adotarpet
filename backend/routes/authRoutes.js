const express = require('express');
const Dono = require('../models/dono');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Rota de Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const dono = await Dono.findOne({ where: { email } });

    if (dono && await dono.compareSenha(senha)) {
      const token = jwt.sign(
        { id: dono.id, email: dono.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      // Adicione o ID do dono na resposta
      res.json({ token, id: dono.id }); // ID incluído aqui
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota de Registro
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const existingDono = await Dono.findOne({ where: { email } });

    if (existingDono) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const novoDono = await Dono.create({ nome, email, senha });
    res.status(201).json(novoDono);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
