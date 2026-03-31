// config/database.js
const { Pool } = require('pg');

// Проверяем наличие переменных окружения
console.log('Initializing database connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PORT:', process.env.DB_PORT);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // Важно для Supabase
    },
    // Таймауты для отладки
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
});

// Проверка подключения
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error connecting to the database:', err.message);
        console.error('Full error:', err);
    } else {
        console.log('✅ Successfully connected to database');
        release();
    }
});

module.exports = pool;
