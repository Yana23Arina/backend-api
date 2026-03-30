// importDump.js
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function importDump() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log("Connected to database ✅");

    // Читаем дамп
    const sql = fs.readFileSync('./gruschn4_01_postgres.sql', 'utf8');

    // Разделяем по точке с запятой
    const commands = sql.split(/;\s*$/m);

    for (let cmd of commands) {
      if (cmd.trim()) {
        await client.query(cmd);
      }
    }

    console.log("Database dump imported successfully! 🎉");
  } catch (err) {
    console.error("Error importing dump:", err);
  } finally {
    await client.end();
  }
}

// Если файл запускается напрямую
if (require.main === module) {
  importDump();
}

module.exports = { importDump };
