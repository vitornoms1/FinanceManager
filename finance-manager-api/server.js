// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_fallback';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];
  if (!tokenHeader) return res.status(403).json({ msg: 'Token não fornecido.' });

  const token = tokenHeader.split(' ')[1]; 

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: 'Token inválido.' });
    req.userId = decoded.id; // Aqui pegamos o ID do usuário logado!
    next();
  });
};

// --- ROTA DE TESTE (Pública) ---
app.get('/', (req, res) => {
  res.send('API Finance Manager rodando! 🚀');
});

// ============================================
// 0. ROTAS DE AUTENTICAÇÃO (PÚBLICAS)
// ============================================

app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  db.query("SELECT email FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ msg: "Erro no servidor." });
    if (results.length > 0) return res.status(400).json({ msg: "Email já em uso." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ msg: "Erro ao salvar." });
      const userId = result.insertId;
      const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: userId, name, email } });
    });
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ msg: "Erro no servidor." });
    if (results.length === 0) return res.status(400).json({ msg: "Usuário não encontrado." });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Senha incorreta." });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });
});

// ============================================
// 🔒 ROTAS PROTEGIDAS (DADOS)
// ============================================
// Tudo abaixo desta linha exige Token e filtra por ID do usuário

app.use(verifyToken); // Aplica a proteção globalmente daqui pra baixo

// Rota /auth/me
app.get('/auth/me', (req, res) => {
  db.query("SELECT id, name, email FROM users WHERE id = ?", [req.userId], (err, results) => {
    if (err) return res.status(500).json({ msg: "Erro." });
    if (results.length === 0) return res.status(404).json({ msg: "Usuário não encontrado." });
    res.json(results[0]);
  });
});

// --- GASTOS (EXPENSES) ---

app.get('/expenses', (req, res) => {
  // Filtra pelo req.userId
  const sql = "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC";
  db.query(sql, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/expenses', (req, res) => {
  const { description, amount, date, category } = req.body;
  // Insere com o req.userId
  const sql = "INSERT INTO expenses (description, amount, date, category, user_id) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [description, amount, date, category, req.userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, description, amount, date, category });
  });
});

app.delete('/expenses/:id', (req, res) => {
  const { id } = req.params;
  // Garante que só deleta se o ID for do usuário
  db.query("DELETE FROM expenses WHERE id = ? AND user_id = ?", [id, req.userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Gasto deletado" });
  });
});

app.put('/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { description, amount, date, category } = req.body;
  // Garante que só edita se for do usuário
  const sql = "UPDATE expenses SET description = ?, amount = ?, date = ?, category = ? WHERE id = ? AND user_id = ?";
  db.query(sql, [description, amount, date, category, id, req.userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: Number(id), description, amount, date, category });
  });
});

// --- RENDA (INCOME) ---

app.get('/incomes', (req, res) => {
  const { month, year } = req.query;
  const sql = "SELECT * FROM incomes WHERE month = ? AND year = ? AND user_id = ?";
  db.query(sql, [month, year, req.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || { amount: 0 }); 
  });
});

app.post('/incomes', (req, res) => {
  const { amount, month, year } = req.body;
  // Remove anterior deste usuário
  const deleteSql = "DELETE FROM incomes WHERE month = ? AND year = ? AND user_id = ?";
  // Insere nova com user_id
  const insertSql = "INSERT INTO incomes (amount, month, year, user_id) VALUES (?, ?, ?, ?)";

  db.query(deleteSql, [month, year, req.userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query(insertSql, [amount, month, year, req.userId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, amount, month, year });
    });
  });
});

// --- CONTAS (BILLS) ---

app.get('/bills', (req, res) => {
  const sql = "SELECT * FROM bills WHERE user_id = ?";
  db.query(sql, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const formatted = results.map(bill => ({
      id: bill.id,
      description: bill.description,
      totalAmount: bill.total_amount,
      totalInstallments: bill.total_installments,
      paidInstallments: bill.paid_installments,
      lastPaymentDate: bill.last_payment_date
    }));
    res.json(formatted);
  });
});

app.post('/bills', (req, res) => {
  const { description, totalAmount, totalInstallments, paidInstallments } = req.body;
  const sql = "INSERT INTO bills (description, total_amount, total_installments, paid_installments, user_id) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [description, totalAmount, totalInstallments, paidInstallments, req.userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ...req.body, id: result.insertId });
  });
});

app.delete('/bills/:id', (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM bills WHERE id = ? AND user_id = ?", [id, req.userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Conta deletada" });
  });
});

app.put('/bills/:id', (req, res) => {
  const { id } = req.params;
  const { description, totalAmount, totalInstallments, paidInstallments } = req.body;
  const sql = "UPDATE bills SET description = ?, total_amount = ?, total_installments = ?, paid_installments = ? WHERE id = ? AND user_id = ?";
  db.query(sql, [description, totalAmount, totalInstallments, paidInstallments, id, req.userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: Number(id), description, totalAmount, totalInstallments, paidInstallments });
  });
});

app.patch('/bills/:id/pay', (req, res) => {
  const { id } = req.params;
  // Recebemos a data que o usuário selecionou no frontend (ou usa hoje como fallback)
  const { date } = req.body; 
  
  db.query("SELECT * FROM bills WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Conta não encontrada" });

    const bill = results[0];

    if (bill.paid_installments >= bill.total_installments) {
      return res.status(400).json({ message: "Esta conta já está quitada!" });
    }

    // TRAVA DE SEGURANÇA INTELIGENTE
    // Compara a data do último pagamento com a data que estamos tentando pagar agora
    const paymentDate = new Date(date || new Date());
    
    if (bill.last_payment_date) {
      const lastPay = new Date(bill.last_payment_date);
      // Se o pagamento anterior foi no mesmo mês e ano da data que estamos tentando pagar...
      if (lastPay.getUTCMonth() === paymentDate.getUTCMonth() && 
          lastPay.getUTCFullYear() === paymentDate.getUTCFullYear()) {
        return res.status(400).json({ message: "Você já pagou a parcela referente a este mês!" });
      }
    }

    const newPaid = bill.paid_installments + 1;
    // Salva a data que veio do frontend (YYYY-MM-DD)
    const dateString = paymentDate.toISOString().split('T')[0];

    const sqlUpdate = "UPDATE bills SET paid_installments = ?, last_payment_date = ? WHERE id = ?";

    db.query(sqlUpdate, [newPaid, dateString, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: bill.id,
        description: bill.description,
        totalAmount: bill.total_amount,
        totalInstallments: bill.total_installments,
        paidInstallments: newPaid,
        lastPaymentDate: dateString
      });
    });
  });
});

// --- INVESTIMENTOS (INVESTMENTS) ---

app.get('/investments', (req, res) => {
  const sql = "SELECT * FROM investments WHERE user_id = ? ORDER BY date DESC";
  db.query(sql, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/investments', (req, res) => {
  // Recebe 'date'
  const { description, amount, date } = req.body;
  const sql = "INSERT INTO investments (description, amount, date, user_id) VALUES (?, ?, ?, ?)";
  
  db.query(sql, [description, amount, date, req.userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, description, amount, date });
  });
});

app.delete('/investments/:id', (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM investments WHERE id = ? AND user_id = ?", [id, req.userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Investimento deletado" });
  });
});

app.put('/investments/:id', (req, res) => {
  const { id } = req.params;
  // Recebe 'date'
  const { description, amount, date } = req.body;
  const sql = "UPDATE investments SET description = ?, amount = ?, date = ? WHERE id = ? AND user_id = ?";
  
  db.query(sql, [description, amount, date, id, req.userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: Number(id), description, amount, date });
  });
});


// ============================================
app.listen(PORT, () => {
  console.log(`✅ Servidor API rodando na porta ${PORT}`);
});