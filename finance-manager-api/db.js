require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'finance_db',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306 
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro Fatal ao conectar no Banco:', err.message);
  } else {
    console.log(`✅ Conectado ao MySQL (Porta ${db.config.port})! Banco: ${db.config.database}`);
  }
});

module.exports = db;