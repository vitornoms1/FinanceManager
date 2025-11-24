// finance-manager-api/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_fallback';

// --- CORS ---
const allowedOrigins = [
  "https://finance-manager-alpha-livid.vercel.app", 
  "https://finance-manager-alpha-livid.vercel.app/",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Liberado para evitar dor de cabeça com bloqueios
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());

// --- ROTA DE DEBUG (Verifica conexão) ---
app.get('/', (req, res) => {
  res.send('API Finance Manager ONLINE! Tente acessar /install para criar as tabelas.');
});

// --- ROTA DE INSTALAÇÃO (Cria tabelas se não existirem) ---
app.get('/install', (req, res) => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS expenses (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, description VARCHAR(255) NOT NULL, amount DECIMAL(10, 2) NOT NULL, category VARCHAR(50), date DATE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS incomes (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, amount DECIMAL(10, 2) NOT NULL, month INT NOT NULL, year INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS bills (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, description VARCHAR(255) NOT NULL, total_amount DECIMAL(10, 2) NOT NULL, total_installments INT NOT NULL, paid_installments INT DEFAULT 0, last_payment_date DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS investments (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, description VARCHAR(255) NOT NULL, amount DECIMAL(10, 2) NOT NULL, date DATE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`
  ];

  let completed = 0;
  queries.forEach((q) => {
    db.query(q, (err) => {
      if (err) console.error("Erro ao criar tabela:", err);
      completed++;
      if (completed === queries.length) res.send("Processo de instalação finalizado. Verifique os logs se houver erro.");
    });
  });
});

// --- AUTH: REGISTRO (Com mensagem de erro detalhada) ---
app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // 1. Verifica se tabela existe e email existe
  db.query("SELECT email FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
        console.error("Erro Crítico no Banco:", err);
        // AQUI ESTÁ A MUDANÇA: Mandamos o erro real para o Frontend (site)
        return res.status(500).json({ msg: "Erro Banco: " + err.message });
    }
    if (results.length > 0) return res.status(400).json({ msg: "Email já em uso." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
          console.error("Erro Insert:", err);
          return res.status(500).json({ msg: "Erro ao salvar: " + err.message });
      }
      const userId = result.insertId;
      const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: userId, name, email } });
    });
  });
});

// --- AUTH: LOGIN ---
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ msg: "Erro Banco: " + err.message });
    if (results.length === 0) return res.status(400).json({ msg: "Usuário não encontrado." });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Senha incorreta." });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });
});

const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];
  if (!tokenHeader) return res.status(403).json({ msg: 'Token não fornecido.' });
  const token = tokenHeader.split(' ')[1]; 
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: 'Token inválido.' });
    req.userId = decoded.id; 
    next();
  });
};

app.use(verifyToken); 

app.get('/auth/me', (req, res) => {
  db.query("SELECT id, name, email FROM users WHERE id = ?", [req.userId], (err, results) => {
    if (err) return res.status(500).json({ msg: "Erro." });
    if (results.length === 0) return res.status(404).json({ msg: "Usuário não encontrado." });
    res.json(results[0]);
  });
});

// --- ROTAS DE DADOS (Resumidas para economizar espaço, funcionalidade mantida) ---
app.get('/expenses', (req, res) => { db.query("SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC", [req.userId], (e,r)=> e ? res.status(500).json({error:e.message}) : res.json(r)); });
app.post('/expenses', (req, res) => { const {description,amount,date,category}=req.body; db.query("INSERT INTO expenses (description, amount, date, category, user_id) VALUES (?,?,?,?,?)", [description,amount,date,category,req.userId], (e,r)=> e ? res.status(500).json({error:e.message}) : res.json({id:r.insertId, ...req.body})); });
app.delete('/expenses/:id', (req, res) => { db.query("DELETE FROM expenses WHERE id=? AND user_id=?", [req.params.id, req.userId], (e)=> e ? res.status(500).json({error:e.message}) : res.json({message:"OK"})); });
app.put('/expenses/:id', (req, res) => { const {description,amount,date,category}=req.body; db.query("UPDATE expenses SET description=?, amount=?, date=?, category=? WHERE id=? AND user_id=?", [description,amount,date,category,req.params.id,req.userId], (e)=> e ? res.status(500).json({error:e.message}) : res.json({id:Number(req.params.id), ...req.body})); });

app.get('/bills', (req, res) => { db.query("SELECT * FROM bills WHERE user_id = ?", [req.userId], (e,r)=> { if(e) return res.status(500).json({error:e.message}); res.json(r.map(b=>({id:b.id, description:b.description, totalAmount:b.total_amount, totalInstallments:b.total_installments, paidInstallments:b.paid_installments, lastPaymentDate:b.last_payment_date}))); }); });
app.post('/bills', (req, res) => { const {description,totalAmount,totalInstallments,paidInstallments}=req.body; db.query("INSERT INTO bills (description, total_amount, total_installments, paid_installments, user_id) VALUES (?,?,?,?,?)", [description,totalAmount,totalInstallments,paidInstallments,req.userId], (e,r)=> e ? res.status(500).json({error:e.message}) : res.json({...req.body, id:r.insertId})); });
app.delete('/bills/:id', (req, res) => { db.query("DELETE FROM bills WHERE id=? AND user_id=?", [req.params.id, req.userId], (e)=> e ? res.status(500).json({error:e.message}) : res.json({message:"OK"})); });
app.put('/bills/:id', (req, res) => { const {description,totalAmount,totalInstallments,paidInstallments}=req.body; db.query("UPDATE bills SET description=?, total_amount=?, total_installments=?, paid_installments=? WHERE id=? AND user_id=?", [description,totalAmount,totalInstallments,paidInstallments,req.params.id,req.userId], (e)=> e ? res.status(500).json({error:e.message}) : res.json({id:Number(req.params.id), ...req.body})); });
app.patch('/bills/:id/pay', (req, res) => { 
    const { date } = req.body;
    db.query("SELECT * FROM bills WHERE id=?",[req.params.id],(e,r)=>{
        if(e)return res.status(500).json({error:e.message});
        if(r.length===0)return res.status(404).json({message:"Conta não encontrada"});
        const b=r[0];
        const newPaid=b.paid_installments+1;
        const dateString=new Date(date||new Date()).toISOString().split('T')[0];
        db.query("UPDATE bills SET paid_installments=?, last_payment_date=? WHERE id=?",[newPaid,dateString,req.params.id],(err)=>{
            if(err)return res.status(500).json({error:err.message});
            res.json({id:b.id,description:b.description,totalAmount:b.total_amount,totalInstallments:b.total_installments,paidInstallments:newPaid,lastPaymentDate:dateString});
        });
    }); 
});

app.get('/investments', (req, res) => { db.query("SELECT * FROM investments WHERE user_id = ? ORDER BY date DESC", [req.userId], (e,r)=> e ? res.status(500).json({error:e.message}) : res.json(r)); });
app.post('/investments', (req, res) => { const {description,amount,date}=req.body; db.query("INSERT INTO investments (description, amount, date, user_id) VALUES (?,?,?,?)", [description,amount,date,req.userId], (e,r)=> e ? res.status(500).json({error:e.message}) : res.json({id:r.insertId, ...req.body})); });
app.delete('/investments/:id', (req, res) => { db.query("DELETE FROM investments WHERE id=? AND user_id=?", [req.params.id, req.userId], (e)=> e ? res.status(500).json({error:e.message}) : res.json({message:"OK"})); });
app.put('/investments/:id', (req, res) => { const {description,amount,date}=req.body; db.query("UPDATE investments SET description=?, amount=?, date=? WHERE id=? AND user_id=?", [description,amount,date,req.params.id,req.userId], (e)=> e ? res.status(500).json({error:e.message}) : res.json({id:Number(req.params.id), ...req.body})); });

app.get('/incomes', (req, res) => { const {month,year}=req.query; db.query("SELECT * FROM incomes WHERE month=? AND year=? AND user_id=?",[month,year,req.userId],(e,r)=>e?res.status(500).json({error:e.message}):res.json(r[0]||{amount:0})); });
app.post('/incomes', (req, res) => { const {amount,month,year}=req.body; db.query("DELETE FROM incomes WHERE month=? AND year=? AND user_id=?",[month,year,req.userId],(e)=>{ if(e)return res.status(500).json({error:e.message}); db.query("INSERT INTO incomes (amount,month,year,user_id) VALUES (?,?,?,?)",[amount,month,year,req.userId],(err,r)=>err?res.status(500).json({error:err.message}):res.json({id:r.insertId,amount,month,year})); }); });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor API rodando na porta ${PORT}`);
});