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

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Falha ao conectar no Banco de Dados:', err.code);
    console.error('⚠️  Se estiver rodando localmente, não use o endereço "mysql.railway.internal". Use "localhost".');
  } else {
    console.log(`✅ Conectado ao MySQL via Pool! Banco: ${process.env.MYSQLDATABASE || 'finance_db'}`);
    connection.release();
  }
});

module.exports = db;