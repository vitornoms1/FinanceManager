require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'finance_db',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão ao iniciar (apenas para log)
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Falha ao conectar no Banco de Dados:', err.code);
    console.error('⚠️  Verifique se as variáveis MYSQLHOST e MYSQLPASSWORD estão certas no Railway.');
  } else {
    console.log(`✅ Conectado ao MySQL com sucesso! Banco: ${process.env.MYSQLDATABASE || 'finance_db'}`);
    connection.release();
  }
});

module.exports = db;