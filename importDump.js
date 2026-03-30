// importDump.js
import pg from "pg";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // читаем .env

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function importDump() {
  try {
    await client.connect();
    console.log("Connected to database ✅");

    const sql = fs.readFileSync("./gruschn4_01_postgres.sql", "utf8");

    // Разделяем на отдельные команды
    const commands = sql.split(/;\s*$/m);

    for (let cmd of commands) {
      if (cmd.trim() !== "") {
        await client.query(cmd);
      }
    }

    console.log("Database dump imported successfully! 🎉");
    await client.end();
  } catch (err) {
    console.error("Error importing dump:", err);
  }
}

// Запуск скрипта
importDump();
