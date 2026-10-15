import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
app.use(express.static(__dirname));
app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'index.html')));

let ranking = {}; let users = {};
try{ ranking = JSON.parse(fs.readFileSync('ranking.json')); }catch{}
try{ users = JSON.parse(fs.readFileSync('users.json')); }catch{}
let fila = [];

function getFaixa(p){ if(p<1000) return 'Branca'; if(p<1250) return 'Azul'; if(p<1500) return 'Amarela'; if(p<1750) return 'Laranja'; if(p<1950) return 'Verde'; if(p<2100) return 'Roxa'; if(p<2400) return 'Marrom'; return 'Preta'; }
function getDivisao(p){
  if(p<1500) return {id:'INICIANTE', nome:'Iniciante (Branca/Azul/Amarela)'};
  if(p<2100) return {id:'INTER', nome:'Intermediario (Laranja/Verde/Roxa)'};
  return {id:'AVANCADO', nome:'Avancado (Marrom/Preta)'};
}
const saveAll = ()=>{ fs.writeFileSync('ranking.json', JSON.stringify(ranking)); fs.writeFileSync('users.json', JSON.stringify(users)); };

io.on('connection', socket=>{
  socket.on('register', ({login, senha, nome})=>{
    if(users[login]) return socket.emit('authError', 'Login ja existe');
    users[login]={login, senha, nome, pontos:1000, v:0, d:0, faixa:getFaixa(1000), trofeus:{ouro:0, prata:0, bronze:0}, conquistas:[], torneios:[]};
    ranking[nome]={pontos:1000, v:0, d:0, faixa:'Branca'};
    saveAll(); socket.emit('authOk', users[login]);
  });
  socket.on('login', ({login, senha})=>{
    const u = users[login];
    if(!u || u.senha!==senha) return socket.emit('authError','Login/senha errado');
    socket.emit('authOk', u);
  });
  socket.on('joinOnlineQueue', ({nome})=>{
    if(!ranking[nome]) ranking[nome]={pontos:1000,v:0,d:0,faixa:'Branca'};
    fila.push({id:socket.id, nome});
    io.emit('filaStatus', fila.length);
    if(fila.length>=2){
      const p1=fila.shift(); const p2=fila.shift();
      const sala='ONLINE-'+Date.now();
      io.sockets.sockets.get(p1.id)?.join(sala); io.sockets.sockets.get(p2.id)?.join(sala);
      io.to(sala).emit('matchStart', {p1, p2, sala, divisao:getDivisao(ranking[p1.nome]?.pontos||1000)});
      io.emit('filaStatus', fila.length);
    }
  });
  socket.on('partidaFinalizada', ({vencedor, perdedor})=>{
    if(!ranking[vencedor]) ranking[vencedor]={pontos:1000,v:0,d:0}; if(!ranking[perdedor]) ranking[perdedor]={pontos:1000,v:0,d:0};
    ranking[vencedor].pontos+=25; ranking[vencedor].v++; ranking[vencedor].faixa=getFaixa(ranking[vencedor].pontos);
    ranking[perdedor].pontos=Math.max(0,ranking[perdedor].pontos-15); ranking[perdedor].d++; ranking[perdedor].faixa=getFaixa(ranking[perdedor].pontos);
    Object.values(users).forEach(u=>{ if(u.nome===vencedor){u.pontos=ranking[vencedor].pontos; u.v++; u.faixa=ranking[vencedor].faixa;} if(u.nome===perdedor){u.pontos=ranking[perdedor].pontos; u.d++; u.faixa=ranking[perdedor].faixa;}});
    saveAll(); io.emit('rankingAtualizado', Object.entries(ranking).map(([name,d])=>({name,...d})).sort((a,b)=>b.pontos-a.pontos));
  });
  socket.on('getRanking', ()=> socket.emit('rankingAtualizado', Object.entries(ranking).map(([name,d])=>({name,...d})).sort((a,b)=>b.pontos-a.pontos)));
});

const PORT = process.env.PORT || 10000;
httpServer.listen(PORT, ()=> console.log('AURUM V2 COMPLETO na '+PORT));
