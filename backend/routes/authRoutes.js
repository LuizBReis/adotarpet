const express = require('express');
const Dono = require('../models/dono');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize'); // Importe Op para usar o operador gt


// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ongpetmatch@gmail.com',
        pass: 'ynjh umui cjdb vsox'
    }
});

// --- NOVO MIDDLEWARE: Verificar Token e Autorização ---
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adiciona as informações do usuário (id, email, role) à requisição
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido.' });
    }
};

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles]; // Converte string para array se for um único papel
    }

    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({ error: 'Acesso proibido. Você não tem permissão para realizar esta ação.' });
        }
        next();
    };
};
// -----------------------------------------------------

// Rota de Login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const dono = await Dono.findOne({ where: { email } });

        if (dono && await dono.compareSenha(senha)) {
            const token = jwt.sign(
                { id: dono.id, email: dono.email, role: dono.role }, // <--- AGORA INCLUI O PAPEL NO TOKEN
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.json({ token, id: dono.id, role: dono.role }); // <--- E NA RESPOSTA DO LOGIN
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
        const { nome, email, senha, telefone, rua, cidade, estado, cep, latitude, longitude } = req.body;

        // **PASSO CRUCIAL: Verifique as unicidades ANTES de tentar criar.**
        // A ordem aqui é importante se você espera dar prioridade de mensagem.
        // Se ambos existirem, o primeiro erro que o backend encontrar é o que será enviado.

        const existingDonoByEmail = await Dono.findOne({ where: { email } });
        if (existingDonoByEmail) {
            return res.status(400).json({ error: 'EMAIL JÁ CADASTRADO. Por favor, use outro e-mail.' });
        }

        const existingDonoByTelefone = await Dono.findOne({ where: { telefone } });
        if (existingDonoByTelefone) {
            return res.status(400).json({ error: 'TELEFONE JÁ CADASTRADO. Por favor, use outro número de telefone.' });
        }

        // Se passar pelas validações de unicidade, cria o novo dono
        const novoDono = await Dono.create({
            nome, email, senha, telefone, rua, cidade, estado, cep, latitude, longitude,
            role: 'comum'
        });
        res.status(201).json(novoDono);
    } catch (error) {
        // Este catch pegará QUALQUER outro erro que não seja de unicidade de email ou telefone já verificados.
        // Por exemplo, erro de validação de formato, ou algum erro de banco de dados inesperado.
        res.status(400).json({ error: error.message || 'Erro desconhecido ao registrar usuário.' });
        console.error('Erro detalhado no registro:', error); // Log para depuração
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

        const resetUrl = `http://localhost:4200/reset-password/${resetToken}`;

        const mailOptions = {
            to: dono.email,
            from: 'ongpetmatch@gmail.com', // Seu e-mail do Gmail aqui
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
                    [Op.gt]: Date.now() // Use Op.gt
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

// Exemplo de rota protegida com middleware (APENAS PARA DEMONSTRAÇÃO)
// router.get('/admin-dashboard', auth, authorize('admin'), (req, res) => {
//     res.json({ message: `Bem-vindo, admin ${req.user.email}!` });
// });

module.exports = { router, auth, authorize }; // Exporte também os middlewares