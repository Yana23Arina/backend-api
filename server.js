const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const museumRoutes = require('./routes/museum');
const adminRoutes = require('./routes/admin');

const { importDump } = require('./importDump'); // импортируем функцию

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/museum', museumRoutes);
app.use('/api/admin', adminRoutes);

// ---- Временный endpoint для импорта дампа ----
app.get('/import-dump', async (req, res) => {
  try {
    await importDump();
    res.send('Database imported successfully!');
  } catch (e) {
    res.status(500).send('Error importing database: ' + e.message);
  }
});
// ---------------------------------------------

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
