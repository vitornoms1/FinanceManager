// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  port: 3307,            // <--- MUDE ESTE NÚMERO PARA O QUE ESTÁ NO WORKBENCH (Ex: 3307)
  user: 'root',
  password: 'inter2013',
  database: 'finance_db' // Agora podemos descomentar, pois vamos achar o lugar certo
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar:', err.message);
    return;
  }
  console.log(`✅ Conectado ao MySQL na porta ${db.config.port} com sucesso!`);
});

module.exports = db;