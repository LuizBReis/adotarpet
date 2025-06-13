const express = require('express');
const Pet = require('../models/pet');
const Dono = require('../models/dono');
const router = express.Router();

const multer = require('multer');
const path = require('path'); // Adicionei esta linha
const fs = require('fs');     // Adicionei esta linha

// --- CONFIGURAÇÃO DO MULTER PARA IMAGENS E VÍDEOS (AJUSTADA) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destFolder = 'uploads/images'; // Pasta padrão para imagens
    if (file.mimetype.startsWith('video/')) {
      destFolder = 'uploads/videos'; // Pasta para vídeos
    }
    // Garante que a pasta de destino exista
    fs.mkdirSync(destFolder, { recursive: true });
    cb(null, destFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // Pega a extensão original (.jpg, .mp4)
    cb(null, uniqueSuffix + ext); // Mantém o nome único com a extensão original
  }
});

const upload = multer({
  storage: storage, // Usar a configuração de storage personalizada
  limits: {
    fileSize: 50 * 1024 * 1024 // Aumentado para 50MB (vídeos podem ser grandes). Ajuste conforme a necessidade.
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; // Adicionado webp
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg']; // Tipos comuns de vídeo
    
    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true); // Aceita o arquivo
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas imagens (jpeg, png, gif, webp) e vídeos (mp4, webm, ogg) são aceitos.'), false);
    }
  }
});
// ---------------------------------------------------


// Criar Pet
router.post('/', upload.array('imagens', 5), async (req, res) => {
  try {
    const { donoId, nome, idade, tipo, raca, castrado, porte, paraAdocao } = req.body;
    
    // Mapeia os caminhos dos arquivos e normaliza para usar barras '/'
    // O caminho salvo será ex: 'uploads/images/arquivo.jpg' ou 'uploads/videos/arquivo.mp4'
    const imagens = req.files.map(file => file.path.replace(/\\/g, '/'));

    if (!donoId) {
      // Remover arquivos caso o donoId seja obrigatório e não fornecido
      req.files.forEach(file => fs.unlinkSync(file.path));
      return res.status(400).json({ error: 'ID do dono é obrigatório' });
    }

    const pet = await Pet.create({ donoId, nome, idade, tipo, raca, castrado, porte, paraAdocao, imagens });
    const dono = await Dono.findByPk(donoId);
    res.status(201).json({ pet, telefoneDono: dono.telefone });
  } catch (error) {
    // Remover arquivos em caso de erro na criação do Pet
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }
    res.status(400).json({ error: error.message });
  }
});

// ... (Rotas GET de Pet - sem alterações na lógica, elas já recuperam o campo 'imagens' do BD) ...

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
    console.log(`Buscando pets para o dono ID: ${donoId}`);
    const pets = await Pet.findAll({ where: { donoId } });
    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Obter pets disponíveis para adoção
router.get('/adocao', async (req, res) => {
  try {
    const pets = await Pet.findAll({
      where: { paraAdocao: true },
      include: {
        model: Dono,
        attributes: ['telefone'], // Incluir o telefone do dono
      },
    });
    // Processar os pets para incluir o telefone do dono na resposta
    const petsComTelefone = pets.map(pet => ({
      ...pet.toJSON(),
      telefoneDono: pet.Dono.telefone, // Adiciona o telefone do dono
    }));

    res.json(petsComTelefone);
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


// Atualizar Pet com upload de imagens (AJUSTADA)
router.put('/:id', upload.array('imagens', 5), async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (pet) {
      const { donoId, nome, idade, tipo, raca, castrado, porte, paraAdocao } = req.body;
      
      let imagens = pet.imagens ? [...pet.imagens] : [];

      if (req.files && req.files.length > 0) {
        // Adicionar novas imagens (e vídeos) ao array de imagens existentes
        imagens = [...imagens, ...req.files.map(file => file.path.replace(/\\/g, '/'))];
      }

      await pet.update({ donoId, nome, idade, tipo, raca, castrado, porte, paraAdocao, imagens });
      res.json(pet);
    } else {
      res.status(404).json({ error: 'Pet não encontrado' });
    }
  } catch (error) {
    // Remover arquivos em caso de erro na atualização
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }
    res.status(400).json({ error: error.message });
  }
});

// Remover uma imagem/mídia específica de um Pet (AJUSTADA)
router.put('/:id/remover-imagem', async (req, res) => { // Mantém o nome do endpoint 'remover-imagem'
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (pet) {
      const { imagemUrl } = req.body; // A URL da imagem/mídia que você quer remover

      if (!pet.imagens || !pet.imagens.includes(imagemUrl)) {
        return res.status(404).json({ error: 'Mídia não encontrada no pet.' }); // Mensagem mais genérica
      }

      const imagensAtualizadas = pet.imagens.filter(imagem => imagem !== imagemUrl);

      // Excluir o arquivo do sistema de arquivos
      // O path deve ser relativo à raiz do projeto ou absoluto.
      // Assumindo que imagemUrl vem como 'uploads/images/file.jpg' ou 'uploads/videos/file.mp4'
      const filePath = path.join(__dirname, '..', imagemUrl);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Remover arquivo fisicamente
        console.log(`Mídia ${imagemUrl} removida do sistema de arquivos.`);
      } else {
        console.log(`Mídia ${imagemUrl} não encontrada no sistema de arquivos (mas removida do DB).`);
      }

      // Atualizar as imagens no banco de dados
      await pet.update({ imagens: imagensAtualizadas });

      res.json({ message: 'Mídia removida com sucesso!', imagens: imagensAtualizadas });
    } else {
      res.status(404).json({ error: 'Pet não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao remover mídia:', error);
    res.status(400).json({ error: error.message });
  }
});

// Deletar Pet (AJUSTADA para remover todas as mídias associadas)
router.delete('/:id', async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (pet) {
      // Excluir todas as mídias (imagens e vídeos) associadas ao pet
      if (pet.imagens && pet.imagens.length > 0) {
        pet.imagens.forEach(mediaPath => {
          const filePath = path.join(__dirname, '..', mediaPath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Mídia ${mediaPath} removida durante a exclusão do pet.`);
          }
        });
      }

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