const express = require('express');
const Dono = require('../models/dono');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Certifique-se de ter instalado: npm install nodemailer

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ongpetmatch@gmail.com', // Coloque seu e-mail do Gmail aqui
        pass: 'ynjh umui cjdb vsox' // Coloque sua senha de aplicativo do Gmail aqui
    }
});

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
      res.json({ token, id: dono.id });
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

// Rota para solicitar redefinição de senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const dono = await Dono.findOne({ where: { email } });

    if (!dono) {
      return res.status(200).json({ message: 'Se um email correspondente for encontrado, um link de redefinição de senha foi enviado.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = Date.now() + 3600000; // 1 hora

    await dono.update({
      passwordResetToken: resetToken,
      passwordResetExpires: new Date(passwordResetExpires)
    });

    const resetUrl = `http://localhost:4200/reset-password/${resetToken}`; // ATENÇÃO: Use a URL real do seu frontend!

    const mailOptions = {
      to: dono.email,
      from: 'seuemail@gmail.com', // Seu e-mail do Gmail aqui
      subject: 'Redefinição de Senha para PETMATCH',
      html: `
        <p>Você solicitou a redefinição de senha para sua conta PETMATCH.</p>
        <p>Por favor, clique no link a seguir para redefinir sua senha:</p>
        <p><a href="${resetUrl}">Redefinir Senha</a></p>
        <p>Este link expira em 1 hora. Se você não solicitou isso, por favor, ignore este email.</p>
        <p>Atenciosamente,<br>Equipe PETMATCH</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Se um email correspondente for encontrado, um link de redefinição de senha foi enviado.' });

  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao solicitar redefinição de senha.' });
  }
});

// Rota para redefinir a senha com o token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { novaSenha } = req.body;

    const dono = await Dono.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [require('sequelize').Op.gt]: Date.now()
        }
      }
    });

    if (!dono) {
      return res.status(400).json({ error: 'Token de redefinição de senha inválido ou expirado.' });
    }

    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    await dono.update({
      senha: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    res.status(200).json({ message: 'Sua senha foi redefinida com sucesso!' });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao redefinir senha.' });
  }
});

module.exports = router;