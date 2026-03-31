// db.js
const { Pool } = require('pg');

// Проверяем наличие переменных окружения
console.log('Database connection config:', {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  hasPassword: !!process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' || true // По умолчанию true для Supabase
});

const pool = new Pool({
  host: process.env.DB_HOST || 'lrtsftvypreppyozreay.supabase.co',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'museum-db',
  ssl: {
    rejectUnauthorized: false // ВАЖНО для Supabase
  },
  // Добавляем таймауты для отладки
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

// Проверка подключения
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    console.error('Full error:', err);
  } else {
    console.log('✅ Successfully connected to database');
    release();
  }
});

module.exports = pool;
