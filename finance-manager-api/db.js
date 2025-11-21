// finance-manager-api/db.js
require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'SuaSenhaLocal',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'finance_db',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306 // <--- Verifique se não está 3307 fixo aqui!
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar:', err.message);
    return;
  }
  console.log(`✅ Conectado ao MySQL na porta ${db.config.port}!`);
});

module.exports = db;