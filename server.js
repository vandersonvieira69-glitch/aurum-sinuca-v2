const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const users = new Map();
let fila = [];

app.post('/api/register', (req, res) => {
  try {
    const { login, senha, nome } = req.body;
    if (!login || !senha) return res.json({ ok: false, msg: 'Preencha login e senha' });
    const key = login.toLowerCase().trim();
    if (users.has(key)) return res.json({ ok: false, msg: 'Login já existe, faça login' });
    const user = { login: key, senha, nome: nome || login, saldo: 1000 };
    users.set(key, user);
    return res.json({ ok: true, user: { nome: user.nome, saldo: user.saldo, login: key } });
  } catch (e) { return res.json({ ok: false, msg: e.message }); }
});

app.post('/api/login', (req, res) => {
  const { login, senha } = req.body;
  if (!login || !senha) return res.json({ ok: false, msg: 'Preencha login e senha' });
  const key = login.toLowerCase().trim();
  const u = users.get(key);
  if (!u || u.senha !== senha) return res.json({ ok: false, msg: 'Login ou senha incorretos' });
  return res.json({ ok: true, user: { nome: u.nome, saldo: u.saldo, login: key } });
});

app.get('/api/fila', (req, res) => res.json({ qtd: fila.length }));
app.post('/api/fila/entrar', (req, res) => {
  const key = (req.body.login || '').toLowerCase().trim();
  if (key && !fila.includes(key)) fila.push(key);
  res.json({ ok: true, qtd: fila.length });
});
app.post('/api/fila/sair', (req, res) => {
  const key = (req.body.login || '').toLowerCase().trim();
  fila = fila.filter(f => f !== key);
  res.json({ ok: true, qtd: fila.length });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('AURUM rodando na porta ' + PORT));
