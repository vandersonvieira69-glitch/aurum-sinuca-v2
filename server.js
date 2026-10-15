const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

let usuarios = {};
let fila = [];
let config = {
  mesas: [{nome:'Bronze',entrada:10,premio:18},{nome:'Prata',entrada:50,premio:90},{nome:'Ouro',entrada:100,premio:180},{nome:'Diamante',entrada:250,premio:450}],
  cores: ['#0f8bc0','#178a27','#c0392b','#6c3483','#111111','#1a5a4a'],
};

app.post('/api/register',(req,res)=>{
  let {login,senha,nome}=req.body; login=(login||'').toLowerCase().trim();
  if(!login||!senha) return res.json({ok:false,msg:'Preencha login e senha'});
  if(usuarios[login]) return res.json({ok:false,msg:'Login já existe'});
  usuarios[login]={senha,nome:nome||login,saldo:1000,nivel:1,xp:35,graduacao:'Branca',vitorias:0,derrotas:0};
  res.json({ok:true,user:usuarios[login]});
});
app.post('/api/login',(req,res)=>{
  let {login,senha}=req.body; login=(login||'').toLowerCase().trim();
  let u=usuarios[login]; if(!u||u.senha!==senha) return res.json({ok:false,msg:'Login ou senha inválidos'});
  res.json({ok:true,user:u});
});
app.post('/api/fila/entrar',(req,res)=>{let {login}=req.body; if(!fila.includes(login)) fila.push(login); res.json({ok:true,fila});});
app.get('/api/fila',(req,res)=>res.json({fila}));

// ADMIN
app.post('/api/admin/login',(req,res)=>{
  if(req.body.login==='admin'&&req.body.senha==='aurum123') return res.json({ok:true});
  res.json({ok:false,msg:'Admin inválido'});
});
app.get('/api/admin/usuarios',(req,res)=>res.json({usuarios,config}));
app.post('/api/admin/usuario/edit',(req,res)=>{
  let {login,campo,valor}=req.body; if(!usuarios[login]) return res.json({ok:false});
  usuarios[login][campo]=campo==='saldo'||campo==='nivel'?Number(valor):valor; res.json({ok:true});
});
app.post('/api/admin/usuario/delete',(req,res)=>{delete usuarios[req.body.login]; res.json({ok:true});});
app.post('/api/admin/config',(req,res)=>{config=req.body.config; res.json({ok:true,config});});

app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'index.html')));
app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'admin.html')));
const PORT=process.env.PORT||3000; app.listen(PORT,()=>console.log('AURUM ON '+PORT));
