const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Configurações Iniciais
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false })); // Permite servir imagens
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração Multer (Memória para processar com Sharp)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas!'));
  }
});

// Endpoint de Upload com Otimização Automática (Sharp)
app.post('/api/upload/:type', upload.single('image'), async (req, res) => {
  try {
    const { type } = req.params; // 'profiles' ou 'logos'
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const folder = path.join(__dirname, 'uploads', type);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const filename = `${Date.now()}-${type}.webp`;
    const outputPath = path.join(folder, filename);

    // Mágica do Sharp: Converte para WebP, redimensiona e otimiza
    await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const publicUrl = `/uploads/${type}/${filename}`;
    res.json({ url: publicUrl, message: 'Imagem otimizada e salva com sucesso!' });
  } catch (error) {
    console.error('Erro no processamento Sharp:', error);
    res.status(500).json({ error: 'Falha ao processar imagem.' });
  }
});

// Mock de Login (Será integrado ao Postgres depois)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const isAdmin = email.includes('admin');
  
  res.json({
    token: 'jwt-token-ficticio',
    user: {
      uid: isAdmin ? 'admin-001' : 'prof-001',
      name: isAdmin ? 'Gestor Municipal' : 'Prof. Sérgio',
      email,
      role: isAdmin ? 'super_admin' : 'teacher'
    }
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'rodando', vps: true }));

app.listen(PORT, () => {
  console.log(`🚀 GEI Backend rodando na porta ${PORT}`);
});
