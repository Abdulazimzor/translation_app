const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create uploads directory if not exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Mock Database
const users = [];

// Routes
app.get('/', (req, res) => {
  res.send('Manga Translation API is running...');
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (users.find(u => u.username === username || u.email === email)) {
      return res.status(400).json({ error: 'Foydalanuvchi nomi yoki email allaqachon band' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), username, email, password: hashedPassword };
    users.push(newUser);
    res.status(201).json({ message: 'Ro\'yxatdan o\'tish muvaffaqiyatli' });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik yuz berdi' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Foydalanuvchi nomi yoki parol xato' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Tizimga kirildi', token, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik yuz berdi' });
  }
});

// Mock translation endpoint
app.post('/api/translate', upload.single('manga'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fayl yuklanmadi' });
  }

  // Here you would normally call an OCR service and then a translation service
  // For now, we'll return a mock response
  setTimeout(() => {
    res.json({
      message: 'Tarjima muvaffaqiyatli yakunlandi',
      original: req.file.filename,
      translated: 'translated_' + req.file.filename,
      text: 'Tarjima qilingan matn bu yerda bo\'ladi.'
    });
  }, 2000);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
