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
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint de Upload com Otimização Automática (Sharp + Base64)
app.post('/api/upload', async (req, res) => {
  try {
    const { image, type } = req.body; // image: base64, type: 'profiles' ou 'logos'
    if (!image) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

    const folderName = type === 'logo' ? 'logos' : 'profiles';
    const folder = path.join(__dirname, 'uploads', folderName);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = `${Date.now()}-${folderName}.webp`;
    const outputPath = path.join(folder, filename);

    // Mágica do Sharp: Converte para WebP, redimensiona e otimiza
    await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const publicUrl = `/api/uploads/${folderName}/${filename}`;
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

// Endpoint de Sincronização (Cloud Sync)
app.post('/api/sync', (req, res) => {
  const { email, data } = req.body;
  if (!email || !data) return res.status(400).json({ error: 'Dados incompletos.' });

  const syncFolder = path.join(__dirname, 'uploads', 'sync');
  if (!fs.existsSync(syncFolder)) fs.mkdirSync(syncFolder, { recursive: true });

  const filePath = path.join(syncFolder, `${email.replace(/[^a-z0-9]/gi, '_')}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.json({ message: 'Dados sincronizados com sucesso!' });
});

app.get('/api/sync/:email', (req, res) => {
  const { email } = req.params;
  const filePath = path.join(__dirname, 'uploads', 'sync', `${email.replace(/[^a-z0-9]/gi, '_')}.json`);

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.status(404).json({ error: 'Nenhum dado encontrado para este usuário.' });
  }
});

// Endpoint para a Secretaria listar todos os professores
app.get('/api/admin/teachers', (req, res) => {
  const syncFolder = path.join(__dirname, 'uploads', 'sync');
  if (!fs.existsSync(syncFolder)) return res.json([]);

  const files = fs.readdirSync(syncFolder);
  const teachers = files.map(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(syncFolder, file), 'utf8'));
      return {
        uid: file.replace('.json', ''),
        email: file.replace('_', '@').replace('.json', ''), // Reconstrução básica do email
        teacherName: content.settings?.teacherName || 'Professor sem nome',
        schoolId: content.settings?.schoolId,
        lastSync: content.lastSync
      };
    } catch (e) { return null; }
  }).filter(t => t !== null);

  res.json(teachers);
});

app.get('/api/health', (req, res) => res.json({ status: 'rodando', vps: true }));

app.listen(PORT, () => {
  console.log(`🚀 GEI Backend rodando na porta ${PORT}`);
});
