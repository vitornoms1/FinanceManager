require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_fallback';

// ======================================================
// 1. CONFIGURAÇÃO DE SEGURANÇA (CORS)
// ======================================================
const allowedOrigins = [
  "https://finance-manager-alpha-livid.vercel.app", 
  "https://finance-manager-alpha-livid.vercel.app/",
  "http://localhost:5173",
  "http://localhost:5173/",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite conexões sem origem (mobile, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Aviso CORS (Origem não listada):", origin);
      // Em caso de emergência, descomente a linha abaixo para liberar tudo:
      // callback(null, true); 
      callback(null, true); // Liberado temporariamente para garantir o funcionamento
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// ======================================================
// 2. ROTA DE INSTALAÇÃO DO BANCO (CRUCIAL PARA O RAILWAY)
// ======================================================
// Acesse essa rota pelo navegador uma vez para criar as tabelas
app.get('/install', (req, res) => {
  const tableQueries = [
    // Tabela Users
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    // Tabela Expenses
    `CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      description VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      category VARCHAR(50),
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    // Tabela Incomes
    `CREATE TABLE IF NOT EXISTS incomes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      month INT NOT NULL,
      year INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    // Tabela Bills
    `CREATE TABLE IF NOT EXISTS bills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      description VARCHAR(255) NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      total_installments INT NOT NULL,
      paid_installments INT DEFAULT 0,
      last_payment_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    // Tabela Investments
    `CREATE TABLE IF NOT EXISTS investments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      description VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  let successCount = 0;
  let errors = [];

  // Executa as queries em sequência
  tableQueries.forEach((query, index) => {
    db.query(query, (err) => {
      if (err) {
        console.error(`Erro ao criar tabela ${index + 1}:`, err);
        errors.push(err.message);
      } else {
        successCount++;
      }
      
      // Se for a última query, responde ao navegador
      if (index === tableQueries.length - 1) {
        if (errors.length > 0) {
           res.status(500).json({ message: "Erros na instalação", errors });
        } else {
           res.send(`✅ SUCESSO! ${successCount} tabelas verificadas/criadas. O banco está pronto! Tente criar a conta agora.`);
        }
      }
    });
  });
});

// ======================================================
// 3. MIDDLEWARES E ROTAS BASE
// ======================================================

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

app.get('/', (req, res) => {
  res.send('API Finance Manager ONLINE! Acesse /install para configurar o banco se necessário.');
});

// ======================================================
// 4. AUTENTICAÇÃO
// ======================================================

app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Verifica se email existe
  db.query("SELECT email FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
        console.error("Erro Banco (Register Select):", err);
        return res.status(500).json({ msg: "Erro no servidor ao verificar email." });
    }
    if (results.length > 0) return res.status(400).json({ msg: "Email já em uso." });

    // Hash da senha e inserção
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
          console.error("Erro Banco (Register Insert):", err);
          return res.status(500).json({ msg: "Erro ao salvar usuário." });
      }
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

// ======================================================
// 5. ROTAS PROTEGIDAS
// ======================================================

app.use(verifyToken); 

app.get('/auth/me', (req, res) => {
  db.query("SELECT id, name, email FROM users WHERE id = ?", [req.userId], (err, results) => {
    if (err) return res.status(500).json({ msg: "Erro." });
    if (results.length === 0) return res.status(404).json({ msg: "Usuário não encontrado." });
    res.json(results[0]);
  });
});

// --- GASTOS (EXPENSES) ---

app.get('/expenses', (req, res) => {
  const sql = "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC";
  db.query(sql, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/expenses', (req, res) => {
  const { description, amount, date, category } = req.body;
  const sql = "INSERT INTO expenses (description, amount, date, category, user_id) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [description, amount, date, category, req.userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, description, amount, date, category });
  });
});

app.delete('/expenses/:id', (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM expenses WHERE id = ? AND user_id = ?", [id, req.userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Gasto deletado" });
  });
});

app.put('/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { description, amount, date, category } = req.body;
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
  const deleteSql = "DELETE FROM incomes WHERE month = ? AND year = ? AND user_id = ?";
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
  const { date } = req.body; 
  
  db.query("SELECT * FROM bills WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Conta não encontrada" });

    const bill = results[0];

    if (bill.paid_installments >= bill.total_installments) {
      return res.status(400).json({ message: "Esta conta já está quitada!" });
    }

    const paymentDate = new Date(date || new Date());
    
    if (bill.last_payment_date) {
      const lastPay = new Date(bill.last_payment_date);
      if (lastPay.getUTCMonth() === paymentDate.getUTCMonth() && 
          lastPay.getUTCFullYear() === paymentDate.getUTCFullYear()) {
        return res.status(400).json({ message: "Você já pagou a parcela referente a este mês!" });
      }
    }

    const newPaid = bill.paid_installments + 1;
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
  const { description, amount, date } = req.body;
  const sql = "UPDATE investments SET description = ?, amount = ?, date = ? WHERE id = ? AND user_id = ?";
  
  db.query(sql, [description, amount, date, id, req.userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: Number(id), description, amount, date });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor API rodando na porta ${PORT}`);
});