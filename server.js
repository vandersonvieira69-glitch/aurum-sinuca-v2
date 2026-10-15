const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let usuarios = [
  {id:1, login:'joao123', nome:'João Nordestino', saldo:150, graduacao:'Branca', nivel:'Iniciante', v:12, d:4},
  {id:2, login:'maria_sinuca', nome:'Maria Sinuca', saldo:80, graduacao:'Azul', nivel:'Iniciante', v:20, d:5},
  {id:3, login:'carlos8ball', nome:'Carlos 8Ball', saldo:300, graduacao:'Roxa', nivel:'Interm.', v:45, d:12}
];

let valoresMesas = {
  Branca:{entrada:10, premio:18},
  Azul:{entrada:15, premio:25},
  Amarela:{entrada:20, premio:32},
  Laranja:{entrada:28, premio:45},
  Verde:{entrada:35, premio:60},
  Roxa:{entrada:50, premio:80},
  Marrom:{entrada:75, premio:120},
  Preta:{entrada:125, premio:200}
};

app.get('/api/usuarios', (req,res)=> res.json(usuarios));
app.get('/api/valores', (req,res)=> res.json(valoresMesas));

app.post('/api/usuarios/:id/faixa', (req,res)=>{
  let u = usuarios.find(x=>x.id==req.params.id);
  if(u){
    u.graduacao = req.body.faixa;
    if(['Branca','Azul','Amarela'].includes(req.body.faixa)) u.nivel='Iniciante';
    else if(['Laranja','Verde','Roxa'].includes(req.body.faixa)) u.nivel='Interm.';
    else u.nivel='Elite';
  }
  res.json({ok:true});
});

app.post('/api/usuarios/:id/excluir', (req,res)=>{
  usuarios = usuarios.filter(x=>x.id!=req.params.id);
  res.json({ok:true});
});

app.post('/api/valores', (req,res)=>{
  valoresMesas = req.body;
  res.json({ok:true});
});

app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log('AURUM rodando na porta '+PORT));
