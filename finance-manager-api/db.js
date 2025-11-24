require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'finance_db',
  port: process.env.MYSQLPORT || 3307
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar:', err.message);
    return;
  }
  console.log(`✅ Conectado ao MySQL (Porta ${db.config.port})! Banco: ${db.config.database}`);
});

module.exports = db;