const express = require('express');
const Pet = require('../models/pet');
const Dono = require('../models/dono');
const router = express.Router();

const multer = require('multer');
const upload = multer({
  dest: 'uploads', // Diretório onde as imagens serão salvas
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não permitido'), false);
    }
    cb(null, true);
  }
});

// Criar Pet
router.post('/', upload.array('imagens', 5), async (req, res) => {
  try {
    const { donoId, nome, idade, tipo, raca, castrado, porte, paraAdocao } = req.body;
    const imagens = req.files.map(file => file.path.replace(/\\/g, '/'));

    if (!donoId) {
      return res.status(400).json({ error: 'ID do dono é obrigatório' });
    }

    const pet = await Pet.create({ donoId, nome, idade, tipo, raca, castrado, porte, paraAdocao, imagens });
    const dono = await Dono.findByPk(donoId);
    res.status(201).json({ pet, telefoneDono: dono.telefone });
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

// Atualizar Pet com upload de imagens
router.put('/:id', upload.array('imagens', 5), async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (pet) {
      const { donoId, nome, idade, tipo, raca, castrado, porte, paraAdocao } = req.body;
      
      // Se imagens foram enviadas, juntar as novas com as existentes
      let imagens = pet.imagens ? [...pet.imagens] : [];

      if (req.files) {
        // Adicionar novas imagens ao array de imagens existentes
        imagens = [...imagens, ...req.files.map(file => file.path.replace(/\\/g, '/'))];
      }

      await pet.update({ donoId, nome, idade, tipo, raca, castrado, porte, paraAdocao, imagens });
      res.json(pet);
    } else {
      res.status(404).json({ error: 'Pet não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const fs = require('fs');
const path = require('path');

// Remover uma imagem específica de um Pet
router.put('/:id/remover-imagem', async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (pet) {
      const { imagemUrl } = req.body; // A URL da imagem que você quer remover

      // Verificar se a imagem existe no array de imagens
      if (!pet.imagens || !pet.imagens.includes(imagemUrl)) {
        return res.status(404).json({ error: 'Imagem não encontrada' });
      }

      // Filtrar a imagem que será removida
      const imagensAtualizadas = pet.imagens.filter(imagem => imagem !== imagemUrl);

      // Excluir a imagem do sistema de arquivos
      const imagePath = path.join(__dirname, '..', imagemUrl); // Caminho da imagem no sistema
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Remover arquivo fisicamente
        console.log(`Imagem ${imagemUrl} removida do sistema de arquivos.`);
      } else {
        console.log(`Imagem ${imagemUrl} não encontrada no sistema de arquivos.`);
      }

      // Atualizar as imagens no banco de dados
      await pet.update({ imagens: imagensAtualizadas });

      // Retornar a resposta com o novo array de imagens
      res.json({ message: 'Imagem removida com sucesso!', imagens: imagensAtualizadas });
    } else {
      res.status(404).json({ error: 'Pet não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao remover imagem:', error);
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
