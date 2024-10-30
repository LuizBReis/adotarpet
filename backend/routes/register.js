// // backend/routes/register.js
// const express = require('express');
// const router = express.Router();
// const Dono = require('../models/dono');

// // Rota de Registro
// router.post('/register', async (req, res) => {
//   try {
//     const { nome, email, senha, rua, cidade, estado, cep, latitude, longitude } = req.body;

//     // Verifique se o email já está em uso
//     const existingDono = await Dono.findOne({ where: { email } });
//     if (existingDono) {
//       return res.status(400).json({ error: 'Email já em uso' });
//     }

//     // Crie um novo dono
//     const novoDono = await Dono.create({
//       nome,
//       email,
//       senha,  // A senha será automaticamente criptografada pelo hook beforeCreate
//       rua,
//       cidade,
//       estado,
//       cep,
//       latitude,
//       longitude
//     });

//     // Retorne a resposta com sucesso
//     res.status(201).json({ message: 'Dono registrado com sucesso', dono: novoDono });
//   } catch (error) {
//     console.error('Erro ao registrar dono', error);
//     res.status(500).json({ error: 'Erro interno do servidor' });
//   }
// });

// module.exports = router;
