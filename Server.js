const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();

// Configurações
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Config do multer para upload
const upload = multer({ dest: 'uploads/' });

// Rota principal - mostra teu site
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de exemplo para upload (se precisares)
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
  }
  res.json({ 
    message: 'Ficheiro recebido com sucesso!',
    file: req.file 
  });
});

// Rota de saúde para o Render saber que está vivo
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Milando-AI' });
});

// Inicia o servidor - OBRIGATÓRIO para o Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Milando-AI rodando na porta ${PORT}`);
});
