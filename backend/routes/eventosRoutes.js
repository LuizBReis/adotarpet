const express = require('express');
const router = express.Router();
const multer = require('multer');
const Evento = require('../models/eventos');

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Pasta onde as imagens serão salvas
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  }
});

// GET todos os eventos
router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.findAll({
      order: [['data', 'ASC']] // Ordena por data ascendente
    });
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST novo evento (com upload de imagem)
router.post('/', upload.single('imagem'), async (req, res) => {
  try {
    // Extrai os dados do corpo da requisição
    const { titulo, descricao, data, local, ongs, contato, cep } = req.body;
    
    const eventoData = {
      titulo,
      descricao,
      data,
      local,
      ongs: ongs || null,
      contato: contato || null,
      cep: cep || null,
      imagem: req.file ? req.file.path.replace(/\\/g, '/') : null // Normaliza o caminho para usar barras normais
    };

    const evento = await Evento.create(eventoData);
    res.status(201).json(evento);
  } catch (err) {
    // Remove o arquivo enviado se houve erro
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, () => {});
    }
    res.status(400).json({ error: err.message });
  }
});

// GET evento por ID
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

// PUT atualizar evento
router.put('/:id', upload.single('imagem'), async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Atualiza os campos
    const { titulo, descricao, data, local, ongs, contato, cep } = req.body;
    
    const updateData = {
      titulo: titulo || evento.titulo,
      descricao: descricao || evento.descricao,
      data: data || evento.data,
      local: local || evento.local,
      ongs: ongs !== undefined ? ongs : evento.ongs,
      contato: contato !== undefined ? contato : evento.contato,
      cep: cep !== undefined ? cep : evento.cep,
      imagem: req.file ? req.file.path.replace(/\\/g, '/') : evento.imagem
    };

    await evento.update(updateData);
    res.json(evento);
  } catch (err) {
    // Remove o arquivo enviado se houve erro
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, () => {});
    }
    res.status(400).json({ error: err.message });
  }
});

// DELETE excluir evento
router.delete('/:id', async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Opcional: remover a imagem associada
    if (evento.imagem) {
      const fs = require('fs');
      fs.unlink(evento.imagem, () => {});
    }

    await evento.destroy();
    res.json({ message: 'Evento excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;