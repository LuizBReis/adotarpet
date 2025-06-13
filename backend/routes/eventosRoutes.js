const express = require('express');
const router = express.Router();
const multer = require('multer');
const Evento = require('../models/eventos');
const { auth, authorize } = require('./authRoutes'); // Importe os middlewares
const path = require('path');
const fs = require('fs');

// --- CONFIGURAÇÃO DO MULTER PARA MÍDIAS (IMAGENS E VÍDEOS) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destFolder = 'uploads/event_media'; // Pasta única para todas as mídias de evento
    // Você pode criar subpastas como 'uploads/event_images' e 'uploads/event_videos' se quiser organizar
    // Mas para simplicidade e não complicar, vamos manter tudo na mesma pasta 'event_media'.
    fs.mkdirSync(destFolder, { recursive: true });
    cb(null, destFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // Aumentado para 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas imagens e vídeos são aceitos.'), false);
    }
  }
});
// ---------------------------------------------------

// GET todos os eventos (rota pública)
router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.findAll({
      order: [['data', 'ASC']]
    });
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST novo evento (com upload de MULTIPLAS MÍDIAS - campo 'imagem')
router.post('/', auth, authorize(['ong', 'admin']), upload.array('imagem', 5), async (req, res) => { // Campo continua 'imagem'
  try {
    const { titulo, descricao, data, local, ongs, contato, cep, hora_inicio, hora_fim } = req.body;
    
    const imagens = req.files.map(file => file.path.replace(/\\/g, '/')); // Campo continua 'imagens'

    const eventoData = {
      titulo,
      descricao,
      data,
      local,
      ongs: ongs || null,
      contato: contato || null,
      cep: cep || null,
      imagens: imagens, // Campo continua 'imagens'
      hora_inicio: hora_inicio || null,
      hora_fim: hora_fim || null
    };

    const evento = await Evento.create(eventoData);
    res.status(201).json(evento);
  } catch (err) {
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }
    res.status(400).json({ error: err.message });
  }
});

// GET evento por ID (rota pública)
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT atualizar evento (com upload de MULTIPLAS MÍDIAS - campo 'imagem')
router.put('/:id', auth, authorize(['ong', 'admin']), upload.array('imagem', 5), async (req, res) => { // Campo continua 'imagem'
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    const { titulo, descricao, data, local, ongs, contato, cep, hora_inicio, hora_fim } = req.body;
    
    // Mídias existentes (se houver) + novas mídias
    let imagens = evento.imagens ? [...evento.imagens] : []; // Campo continua 'imagens'

    if (req.files && req.files.length > 0) {
      imagens = [...imagens, ...req.files.map(file => file.path.replace(/\\/g, '/'))];
    }

    const updateData = {
      titulo: titulo || evento.titulo,
      descricao: descricao || evento.descricao,
      data: data || evento.data,
      local: local || evento.local,
      ongs: ongs !== undefined ? ongs : evento.ongs,
      contato: contato !== undefined ? contato : evento.contato,
      cep: cep !== undefined ? cep : evento.cep,
      imagens: imagens, // Campo continua 'imagens'
      hora_inicio: hora_inicio || null,
      hora_fim: hora_fim || null
    };

    await evento.update(updateData);
    res.json(evento);
  } catch (err) {
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }
    res.status(400).json({ error: err.message });
  }
});

// NOVO: Remover uma mídia específica de um Evento (mantém 'remover-imagem')
router.put('/:id/remover-imagem', auth, authorize(['ong', 'admin']), async (req, res) => { // Mantém o nome do endpoint
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    const { imagemUrl } = req.body; // A URL da mídia que você quer remover (mantém 'imagemUrl')

    if (!evento.imagens || !evento.imagens.includes(imagemUrl)) { // Campo continua 'imagens'
      return res.status(404).json({ error: 'Mídia não encontrada no evento.' });
    }

    const imagensAtualizadas = evento.imagens.filter(item => item !== imagemUrl); // Campo continua 'imagens'

    // Excluir o arquivo do sistema de arquivos
    const filePath = path.join(__dirname, '..', imagemUrl);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Mídia ${imagemUrl} removida do sistema de arquivos.`);
    } else {
      console.log(`Mídia ${imagemUrl} não encontrada no sistema de arquivos (mas removida do DB).`);
    }

    await evento.update({ imagens: imagensAtualizadas }); // Campo continua 'imagens'

    res.json({ message: 'Mídia removida com sucesso!', imagens: imagensAtualizadas }); // Campo continua 'imagens'
  } catch (error) {
    console.error('Erro ao remover mídia:', error);
    res.status(400).json({ error: error.message });
  }
});


// DELETE excluir evento (agora remove todas as mídias associadas)
router.delete('/:id', auth, authorize(['ong', 'admin']), async (req, res) => {
  console.log('Requisição DELETE recebida para ID:', req.params.id);
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Excluir todas as mídias (imagens e vídeos) associadas ao evento
    if (evento.imagens && evento.imagens.length > 0) { // Campo continua 'imagens'
      evento.imagens.forEach(mediaPath => {
        const filePath = path.join(__dirname, '..', mediaPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Mídia ${mediaPath} removida durante a exclusão do evento.`);
        }
      });
    }

    await evento.destroy();
    res.json({ message: 'Evento excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar evento:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;