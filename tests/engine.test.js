// Testes do engine — rode na raiz do projeto com: node --test
// Zero dependências: só node:test e node:assert.
const { test } = require('node:test');
const assert = require('node:assert/strict');

const config = require('../engine/config.js');
const ativos = require('../engine/ativos.js');
const formato = require('../engine/formato.js');
const eventos = require('../engine/eventos.js');
const placar = require('../engine/placar.js');
const regras = require('../engine/regras.js');

// rng determinístico: devolve a sequência dada e repete o último valor.
function rngFixo(...vals) {
  let i = 0;
  return () => (i < vals.length ? vals[i++] : vals[vals.length - 1]);
}

// Um mês "neutro": 10 chamadas 0.5 (retorno = média de cada ativo) e depois
// 0.99 no sorteio de evento (0.99 > chance em qualquer dificuldade → sem evento).
const rngNeutro = () => rngFixo(...Array(10).fill(0.5), 0.99);

function jogoEmAndamento(props) {
  const s = regras.novoJogo(props || {});
  s.tela = 'jogo';
  return s;
}

// ---------- novoJogo ----------

test('novoJogo normal: caixa 3000 e custo 70% do salário', () => {
  const s = regras.novoJogo({ dificuldade: 'normal', salarioInicial: 4500 });
  assert.equal(s.caixa, 3000);
  assert.equal(s.custo, 3150);
  assert.equal(s.hard, false);
  assert.deepEqual(s.ativos, { reserva: 0, rendafixa: 0, fiis: 0, acoes: 0, cripto: 0 });
});

test('novoJogo hardcore: caixa 1500 e custo 76% do salário', () => {
  const s = regras.novoJogo({ dificuldade: 'hardcore', salarioInicial: 4500 });
  assert.equal(s.caixa, 1500);
  assert.equal(s.custo, 3420);
  assert.equal(s.hard, true);
});

test('novoJogo sem props usa defaults do config', () => {
  const s = regras.novoJogo({});
  assert.equal(s.salario, config.salarioDefault);
  assert.equal(s.tela, 'intro');
  assert.equal(s.fim, null);
});

test('novoJogo registra dificuldade e modo no estado', () => {
  assert.equal(regras.novoJogo({ dificuldade: 'normal' }).dificuldade, 'normal');
  assert.equal(regras.novoJogo({ dificuldade: 'hardcore' }).dificuldade, 'hardcore');
  assert.equal(regras.novoJogo({}).modo, 'classico');
});

test('config.modos tem exatamente um modo disponível (clássico) por enquanto', () => {
  const disponiveis = config.modos.filter(m => m.disponivel);
  assert.deepEqual(disponiveis.map(m => m.id), ['classico']);
});

// ---------- mover ----------

test('mover: aporte é limitado ao caixa', () => {
  const s = jogoEmAndamento();
  s.caixa = 700;
  const upd = regras.mover(s, 'reserva', 1000);
  assert.equal(upd.ativos.reserva, 700);
  assert.equal(upd.caixa, 0);
});

test('mover: resgate é limitado ao saldo do ativo', () => {
  const s = jogoEmAndamento();
  s.caixa = 0;
  s.ativos.acoes = 300;
  const upd = regras.mover(s, 'acoes', -1000);
  assert.equal(upd.ativos.acoes, 0);
  assert.equal(upd.caixa, 300);
});

test('mover: valores abaixo de 1 não fazem nada', () => {
  const s = jogoEmAndamento();
  s.caixa = 0;
  assert.deepEqual(regras.mover(s, 'fiis', 500), {}); // sem caixa
  assert.deepEqual(regras.mover(s, 'fiis', -500), {}); // sem saldo
});

// ---------- cobrir (liquidação em cascata) ----------

test('cobrir: liquida na ordem reserva → renda fixa, com deságio de 2%', () => {
  const s = jogoEmAndamento();
  s.mes = 5;
  s.ativos.reserva = 1000;
  s.ativos.rendafixa = 1000;
  const logs = [];
  const falta = regras.cobrir(s, 1500, logs);
  assert.ok(falta <= 1e-9, 'déficit deveria ser coberto');
  assert.equal(s.ativos.reserva, 0); // usada primeiro, sem perda
  // pra levantar 500 líquidos com deságio de 2%, vende 500/0.98 brutos
  assert.ok(Math.abs(s.ativos.rendafixa - (1000 - 500 / 0.98)) < 1e-9);
  assert.equal(logs.length, 2);
});

test('cobrir: devolve o que faltou quando os ativos acabam', () => {
  const s = jogoEmAndamento();
  s.ativos.reserva = 1000;
  const falta = regras.cobrir(s, 5000, []);
  assert.equal(falta, 4000);
  assert.equal(s.ativos.reserva, 0);
});

// ---------- fecharMes ----------

test('fecharMes neutro: entra salário, sai custo, inflação de base aplica', () => {
  const st = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  const s = regras.fecharMes(st, { rng: rngNeutro() });
  assert.equal(s.mes, 1);
  assert.equal(s.caixa, 3000 + 4500 - 3150);
  assert.equal(s.custo, Math.round(3150 * config.dificuldades.normal.inflacaoBase));
  assert.equal(s.fim, null);
  assert.equal(s.hist.length, 1);
  assert.equal(st.mes, 0, 'estado original não pode ser mutado');
});

test('fecharMes: ativos rendem a média com rng 0.5 e FIIs pagam dividendo no caixa', () => {
  const st = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  st.ativos.fiis = 10000;
  const s = regras.fecharMes(st, { rng: rngNeutro() });
  const fii = ativos.find(a => a.key === 'fiis');
  const valorEsperado = 10000 * (1 + fii.ret);
  assert.ok(Math.abs(s.ativos.fiis - valorEsperado) < 1e-9);
  assert.equal(s.varMes.fiis, fii.ret);
  const dividendo = valorEsperado * fii.div;
  assert.ok(Math.abs(s.caixa - (3000 + 4500 - 3150 + dividendo)) < 1e-9);
  assert.ok(s.log.some(l => l.texto.includes('Renda passiva recebida')));
});

test('fecharMes: mês sem salário desconta o contador e não paga salário', () => {
  const st = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  st.semSalario = 2;
  const s = regras.fecharMes(st, { rng: rngNeutro() });
  assert.equal(s.semSalario, 1);
  assert.equal(s.caixa, 3000 - 3150 + 0); // sem salário… mas com liquidação? não há ativos: caixa negativo
  // sem ativos pra liquidar, caixa negativo → falência
  assert.equal(s.fim, 'faliu');
  assert.ok(s.log.some(l => l.texto.includes('sem salário')));
});

test('fecharMes: progressão anual de salário no mês 12', () => {
  const st = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  st.mes = 11;
  st.caixa = 100000; // folga pra não interferir
  const s = regras.fecharMes(st, { rng: rngNeutro() });
  assert.equal(s.mes, 12);
  assert.equal(s.salario, Math.round(4500 * config.progressaoAnual));
  assert.ok(s.log.some(l => l.texto.includes('PROGRESSÃO ANUAL')));
});

test('fecharMes: falência quando nem a liquidação cobre o caixa negativo', () => {
  const st = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  st.caixa = 0;
  st.salario = 0;
  const s = regras.fecharMes(st, { rng: rngNeutro() });
  assert.equal(s.fim, 'faliu');
  assert.equal(s.auto, false);
  assert.ok(s.fimTs > 0);
});

test('fecharMes: liberdade quando a renda passiva supera o custo de vida', () => {
  const st = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  st.ativos.fiis = 1e6; // rp ≈ 28k >> custo 3150
  const s = regras.fecharMes(st, { rng: rngNeutro() });
  assert.equal(s.fim, 'livre');
  assert.ok(s.log.some(l => l.texto.includes('INDEPENDÊNCIA FINANCEIRA')));
});

test('fecharMes: AUTO continua ligado mesmo quando um evento acontece', () => {
  const st = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  st.mes = 5;
  st.auto = true;
  st.caixa = 100000; // folga pra não terminar o jogo no turno
  st.ativos.acoes = 1000;
  // 10× 0.5 (retornos médios), depois 0 no sorteio e 0 na seleção → crash da bolsa
  const s = regras.fecharMes(st, { rng: rngFixo(...Array(10).fill(0.5), 0, 0) });
  assert.ok(s.log.some(l => l.texto.includes('CRASH')), 'o evento deveria ter acontecido');
  assert.equal(s.auto, true);
  assert.ok(!s.log.some(l => l.texto.includes('AUTO pausado')));
});

test('fecharMes: log não passa do limite configurado', () => {
  const st = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  st.log = Array.from({ length: config.logMax + 40 }, (_, i) => ({ id: i, mes: 'M00', texto: 'x', cor: '#fff' }));
  st.proximoLogId = st.log.length;
  const s = regras.fecharMes(st, { rng: rngNeutro() });
  assert.equal(s.log.length, config.logMax);
});

// ---------- eventos ----------

test('eventos: nada acontece antes do mês mínimo', () => {
  const s = jogoEmAndamento();
  s.mes = config.mesMinimoEvento - 1;
  const logs = [];
  eventos.sortear(s, logs, { rng: rngFixo(0, 0), addLog: regras.addLog });
  assert.equal(logs.length, 0);
});

test('eventos: rng no primeiro peso sorteia o crash da bolsa', () => {
  const s = jogoEmAndamento();
  s.mes = 5;
  s.ativos.acoes = 1000;
  s.ativos.fiis = 1000;
  const logs = [];
  eventos.sortear(s, logs, { rng: rngFixo(0, 0), addLog: regras.addLog });
  assert.equal(s.ativos.acoes, 700);
  assert.equal(s.ativos.fiis, 880);
  assert.ok(logs[0].texto.includes('CRASH'));
});

test('eventos: rng no fim da faixa sorteia o último evento (grana inesperada)', () => {
  const s = jogoEmAndamento();
  s.mes = 5;
  const caixaAntes = s.caixa;
  const logs = [];
  eventos.sortear(s, logs, { rng: rngFixo(0, 0.9999, 0.5), addLog: regras.addLog });
  assert.ok(s.caixa > caixaAntes);
  assert.ok(logs[0].texto.includes('GRANA INESPERADA'));
});

test('eventos: rng acima da chance não sorteia nada', () => {
  const s = jogoEmAndamento();
  s.mes = 10;
  const logs = [];
  eventos.sortear(s, logs, { rng: rngFixo(0.99), addLog: regras.addLog });
  assert.equal(logs.length, 0);
});

// ---------- placar ----------

function storageFake() {
  const mem = {};
  return { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = v; } };
}

test('placar: salva a partida e ordena livres por menos meses', () => {
  const st = storageFake();
  placar.salvar({ fim: 'livre', mes: 30, inicioTs: 1000, fimTs: 61000 }, 50000, st);
  const lista = placar.ler(st);
  assert.equal(lista[0].meses, 30); // vence ANA (44) e CARLOS (61)
  assert.equal(lista[0].voce, true);
  assert.equal(lista[0].tempo, 60);
});

test('placar: falidos vêm depois dos livres, ordenados por quem durou mais', () => {
  const lista = placar.ler(storageFake());
  const status = lista.map(p => p.status);
  assert.deepEqual(status, ['livre', 'livre', 'faliu', 'faliu']);
  const falidos = lista.filter(p => p.status === 'faliu');
  assert.ok(falidos[0].meses >= falidos[1].meses);
});

// ---------- formato ----------

test('formato: fmt em pt-BR e fmtTempo com horas', () => {
  assert.equal(formato.fmt(1234), 'R$ 1.234');
  assert.equal(formato.fmtTempo(65000), '01:05');
  assert.equal(formato.fmtTempo(3665000), '1:01:05');
  assert.equal(formato.fmtTempo(-5), '00:00');
});

test('formato: sparkline mapeia o histórico pra polyline 180×34', () => {
  const um = formato.sparkline([100]);
  assert.equal(um.points, '90.0,30.0');
  const dois = formato.sparkline([100, 200]);
  assert.equal(dois.points, '2.0,30.0 178.0,4.0');
  assert.equal(dois.positivo, true);
  assert.equal(formato.sparkline([200, 100]).positivo, false);
});
