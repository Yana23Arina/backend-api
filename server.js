// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { importDump } = require('./importDump'); // на случай ручного импорта

dotenv.config();

const authRoutes = require('./routes/auth');
const museumRoutes = require('./routes/museum');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Мидлвары
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/museum', museumRoutes);
app.use('/api/admin', adminRoutes);

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
