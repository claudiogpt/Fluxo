// Testes do engine — rode na raiz do projeto com: node --test
// Zero dependências: só node:test e node:assert.
const { test } = require('node:test');
const assert = require('node:assert/strict');

const config = require('../engine/config.js');
const ativos = require('../engine/ativos.js');
const formato = require('../engine/formato.js');
const eventos = require('../engine/eventos.js');
const placar = require('../engine/placar.js');
const conceitos = require('../engine/conceitos.js');
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

test('config.modos: clássico, sandbox, empresário e cenários disponíveis; speedrun em breve', () => {
  const disponiveis = config.modos.filter(m => m.disponivel);
  assert.deepEqual(disponiveis.map(m => m.id), ['classico', 'sandbox', 'empresario', 'cenarios']);
});

// ---------- modo sandbox ----------

test('sandbox: novoJogo aceita capital inicial customizado', () => {
  const s = regras.novoJogo({ modo: 'sandbox', dificuldade: 'normal', capitalInicial: 100000 });
  assert.equal(s.modo, 'sandbox');
  assert.equal(s.caixa, 100000);
  assert.equal(s.capitalInicial, 100000);
  // sem capital custom, cai no default da dificuldade
  assert.equal(regras.novoJogo({ modo: 'sandbox', dificuldade: 'normal' }).caixa, 3000);
});

test('sandbox: caixa negativo avisa uma vez e não encerra o jogo', () => {
  const st = jogoEmAndamento({ modo: 'sandbox', dificuldade: 'normal', salarioInicial: 4500 });
  st.caixa = 0;
  st.salario = 0;
  const s = regras.fecharMes(st, { rng: rngNeutro() });
  assert.equal(s.fim, null);
  assert.ok(s.caixa < 0);
  assert.equal(s.log.filter(l => l.texto.includes('CAIXA NEGATIVO')).length, 1);
  // segue negativo no mês seguinte: sem novo aviso e ainda sem fim
  const s2 = regras.fecharMes(s, { rng: rngNeutro() });
  assert.equal(s2.fim, null);
  assert.equal(s2.log.filter(l => l.texto.includes('CAIXA NEGATIVO')).length, 1);
});

test('sandbox: renda passiva ≥ custo vira marco no log, não vitória', () => {
  const st = jogoEmAndamento({ modo: 'sandbox', dificuldade: 'normal', salarioInicial: 4500 });
  st.ativos.fiis = 1e6;
  const s = regras.fecharMes(st, { rng: rngNeutro() });
  assert.equal(s.fim, null);
  assert.equal(s.marcoLivre, true);
  assert.equal(s.log.filter(l => l.texto.includes('MARCO')).length, 1);
  // marco não repete
  const s2 = regras.fecharMes(s, { rng: rngNeutro() });
  assert.equal(s2.log.filter(l => l.texto.includes('MARCO')).length, 1);
});

// ---------- modo empresário ----------

// No modo empresário há 2 chamadas extras de rng (variância da receita) antes dos ativos.
const rngNeutroEmp = () => rngFixo(...Array(12).fill(0.5), 0.99);

test('empresário: novoJogo zera salário, mantém custo de vida e cria o negócio', () => {
  const s = regras.novoJogo({ modo: 'empresario', dificuldade: 'normal', salarioInicial: 4500 });
  assert.equal(s.salario, 0);
  assert.equal(s.custo, 3150); // custo derivado do salário de referência, não do salário zerado
  assert.equal(s.negocio.caixa, config.empresario.caixaInicial);
  assert.equal(s.negocio.receitaBase, config.empresario.receitaBase);
  assert.equal(s.negocio.falido, false);
  assert.equal(regras.novoJogo({ dificuldade: 'normal' }).negocio, null);
});

test('empresário: mês neutro — receita entra na PJ e déficit pessoal força retirada da empresa', () => {
  const st = jogoEmAndamento({ modo: 'empresario', dificuldade: 'normal', salarioInicial: 4500 });
  const s = regras.fecharMes(st, { rng: rngNeutroEmp() });
  assert.equal(s.negocio.receitaMes, config.empresario.receitaBase); // rng 0.5 → variância zero
  // PJ: 4000 + 7500 − 3500 = 8000; pessoal: 3000 − 3150 = −150 → retirada forçada de 150
  assert.equal(s.negocio.caixa, 8000 - 150);
  assert.equal(s.caixa, 0);
  assert.equal(s.fim, null);
  assert.ok(s.log.some(l => l.texto.includes('Retirada forçada')));
});

test('empresário: patrimônio inclui o caixa da empresa', () => {
  const s = regras.novoJogo({ modo: 'empresario', dificuldade: 'normal' });
  assert.equal(regras.patrimonio(s), s.caixa + config.empresario.caixaInicial);
});

test('empresário: reinvestir tem retornos decrescentes e exige caixa na empresa', () => {
  const s = regras.novoJogo({ modo: 'empresario' });
  const u1 = regras.reinvestirNegocio(s);
  assert.equal(u1.negocio.caixa, config.empresario.caixaInicial - 1000);
  assert.equal(u1.negocio.receitaBase, config.empresario.receitaBase + 180);
  assert.equal(u1.negocio.nivel, 1);
  const u2 = regras.reinvestirNegocio({ ...s, ...u1 });
  assert.equal(u2.negocio.receitaBase, u1.negocio.receitaBase + Math.round(180 / 1.35));
  const pobre = { ...s, negocio: { ...s.negocio, caixa: 500 } };
  assert.deepEqual(regras.reinvestirNegocio(pobre), {});
});

test('empresário: sacar limita ao caixa da empresa e aportar ao caixa pessoal', () => {
  const s = regras.novoJogo({ modo: 'empresario', dificuldade: 'normal' }); // PF 3000, PJ 4000
  const saque = regras.sacarNegocio(s, 10000);
  assert.equal(saque.caixa, 3000 + 4000);
  assert.equal(saque.negocio.caixa, 0);
  const aporte = regras.aportarNegocio(s, 10000);
  assert.equal(aporte.caixa, 0);
  assert.equal(aporte.negocio.caixa, 4000 + 3000);
  const falido = { ...s, negocio: { ...s.negocio, falido: true } };
  assert.deepEqual(regras.sacarNegocio(falido, 500), {});
  assert.deepEqual(regras.aportarNegocio(falido, 500), {});
});

test('empresário: N meses no vermelho quebram a empresa, mas não o jogador', () => {
  let s = jogoEmAndamento({ modo: 'empresario', dificuldade: 'normal' });
  s.caixa = 100000; // vida pessoal folgada
  s.negocio.custoFixo = 50000; // sangria brutal na PJ
  for (let i = 0; i < config.empresario.mesesFalencia; i++) {
    assert.equal(s.negocio.falido, false);
    s = regras.fecharMes(s, { rng: rngNeutroEmp() });
  }
  assert.equal(s.negocio.falido, true);
  assert.equal(s.negocio.caixa, 0); // dívidas morrem com o CNPJ
  assert.equal(s.negocio.receitaBase, 0);
  assert.equal(s.fim, null); // falência da empresa ≠ FALIU pessoal
  assert.ok(s.log.some(l => l.texto.includes('SEU NEGÓCIO FALIU')));
  // com a empresa morta, o mês seguinte roda sem o bloco do negócio (sem crash)
  const s2 = regras.fecharMes(s, { rng: rngNeutro() });
  assert.equal(s2.negocio.falido, true);
});

test('eventos por modo: empresário sem eventos de emprego; clássico sem eventos de empresa', () => {
  const coleta = (props) => {
    const textos = [];
    for (let i = 0; i < 400; i++) {
      const s = jogoEmAndamento(props);
      s.mes = 10;
      const logs = [];
      eventos.sortear(s, logs, { rng: Math.random, addLog: regras.addLog });
      for (const l of logs) textos.push(l.texto);
    }
    return textos;
  };
  const emp = coleta({ modo: 'empresario', dificuldade: 'normal' });
  assert.ok(emp.length > 30, 'eventos deveriam ter acontecido no empresário');
  assert.ok(!emp.some(t => /DEMISSÃO|PROMOÇÃO|13º/.test(t)));
  assert.ok(emp.some(t => t.includes('empresa')));
  const cls = coleta({ dificuldade: 'normal' });
  assert.ok(cls.length > 30, 'eventos deveriam ter acontecido no clássico');
  assert.ok(!cls.some(t => t.includes('empresa')));
});

test('empresário: sem progressão anual de salário (não há salário)', () => {
  const st = jogoEmAndamento({ modo: 'empresario', dificuldade: 'normal' });
  st.mes = 11;
  st.caixa = 100000;
  const s = regras.fecharMes(st, { rng: rngNeutroEmp() });
  assert.equal(s.salario, 0);
  assert.ok(!s.log.some(l => l.texto.includes('PROGRESSÃO ANUAL')));
});

// ---------- cenário aposentadoria ----------

// Um mês de saque com a carteira toda em cripto (div=0, vol=0.24, ret=0.035).
// Injeta um rng constante que faz a cripto render exatamente `retorno`.
function mesCripto(s, retorno) {
  const c = (1 + (retorno - 0.035) / 0.24) / 2;
  return regras.fecharMes(s, { rng: rngFixo(...Array(10).fill(c)) });
}

function estadoSaque(overrides) {
  const s = regras.novoJogo({ modo: 'cenarios', cenario: 'aposentadoria', dificuldade: 'normal' });
  s.tela = 'jogo';
  s.aposentadoria = { ...s.aposentadoria, fase: 'saque', ...(overrides && overrides.aposentadoria) };
  s.custo = 6000;      // saque fixo mensal
  s.caixa = 0;
  s.ativos = { ...s.ativos, cripto: 10000 };
  return s;
}

test('aposentadoria: novoJogo cria as duas fases e usa o capital do config', () => {
  const s = regras.novoJogo({ modo: 'cenarios', cenario: 'aposentadoria', dificuldade: 'normal' });
  assert.equal(s.cenario, 'aposentadoria');
  assert.equal(s.caixa, config.aposentadoria.capitalInicial);
  assert.equal(s.salario, config.aposentadoria.salario);
  assert.equal(s.aposentadoria.fase, 'acumulacao');
  assert.equal(s.aposentadoria.turnosSaque, config.aposentadoria.turnosSaque);
  // fora do cenário, sem objeto de aposentadoria
  assert.equal(regras.novoJogo({ dificuldade: 'normal' }).aposentadoria, null);
});

test('aposentadoria: acumulação vira saque após turnosAcumulacao e zera o salário', () => {
  let s = regras.novoJogo({ modo: 'cenarios', cenario: 'aposentadoria', dificuldade: 'normal' });
  s.tela = 'jogo';
  s.aposentadoria = { ...s.aposentadoria, turnosAcumulacao: 2 };
  s.caixa = 50000;
  s = regras.fecharMes(s, { rng: rngNeutro() });
  assert.equal(s.aposentadoria.fase, 'acumulacao');
  assert.equal(s.fim, null);
  s = regras.fecharMes(s, { rng: rngNeutro() });
  assert.equal(s.aposentadoria.fase, 'saque');
  assert.equal(s.salario, 0);
  assert.equal(s.fim, null);
});

test('aposentadoria: acumulação não dispara livre nem faliu', () => {
  let s = regras.novoJogo({ modo: 'cenarios', cenario: 'aposentadoria', dificuldade: 'normal' });
  s.tela = 'jogo';
  s.ativos = { ...s.ativos, fiis: 1e6 }; // renda passiva enorme
  s = regras.fecharMes(s, { rng: rngNeutro() });
  assert.equal(s.fim, null);
});

test('aposentadoria: saque fixo vende a valor justo, sem deságio', () => {
  let s = estadoSaque();
  s = mesCripto(s, 0); // cripto fica 10000; saca 6000 a par → 4000
  assert.ok(Math.abs(s.ativos.cripto - 4000) < 1, 'vendeu a valor justo, sem deságio');
  assert.equal(s.aposentadoria.saquesFeitos, 1);
  assert.equal(s.aposentadoria.saqueMes, 6000);
});

test('aposentadoria: modo % saca fração do patrimônio', () => {
  let s = estadoSaque({ aposentadoria: { saqueModo: 'percentual', taxaSaque: 0.10 } });
  s = mesCripto(s, 0); // patrimônio 10000 → saca 10% = 1000
  assert.ok(Math.abs(s.ativos.cripto - 9000) < 1);
  assert.equal(s.aposentadoria.saqueMes, 1000);
});

test('aposentadoria: sobreviver todos os turnosSaque meses vence', () => {
  let s = estadoSaque({ aposentadoria: { turnosSaque: 2 } });
  s.ativos = { ...s.ativos, cripto: 1e7 };
  s = mesCripto(s, 0);
  assert.equal(s.fim, null);
  assert.equal(s.aposentadoria.saquesFeitos, 1);
  s = mesCripto(s, 0);
  assert.equal(s.fim, 'apos_sucesso');
  assert.equal(s.aposentadoria.saquesFeitos, 2);
});

// O TESTE-CHAVE: prova que a mecânica ensina risco de SEQUÊNCIA, não só variância.
test('aposentadoria: mesma média, ordem diferente dos retornos → sobrevivência diferente', () => {
  // Ordem A: ano ruim primeiro
  let a = mesCripto(estadoSaque(), -0.5);
  assert.equal(a.fim, 'apos_faliu');
  const sobrevA = a.aposentadoria.saquesFeitos;

  // Ordem B: mesmos retornos (-0.5 e +0.5), invertidos → ano bom primeiro
  let b = mesCripto(estadoSaque(), 0.5);
  assert.equal(b.fim, null);
  b = mesCripto(b, -0.5);
  assert.equal(b.fim, 'apos_faliu');
  const sobrevB = b.aposentadoria.saquesFeitos;

  assert.notEqual(sobrevA, sobrevB); // a ORDEM decidiu o resultado
  assert.equal(sobrevA, 0);
  assert.equal(sobrevB, 1);
});

test('aposentadoria: eventos ficam desligados na fase de saque', () => {
  let s = estadoSaque({ aposentadoria: { turnosSaque: 100 } });
  s.ativos = { ...s.ativos, cripto: 1e7 };
  for (let i = 0; i < 20; i++) s = mesCripto(s, 0.02);
  const txt = s.log.map(l => l.texto).join(' ');
  assert.ok(!/CRASH|EMERGÊNCIA|IMPREVISTO|INFLAÇÃO ALTA|BULL RUN|INVERNO|PROMOÇÃO|DEMISSÃO/.test(txt));
});

// ---------- cenário imóveis ----------

// 2 chamadas extras de rng (valorização do imóvel) antes dos ativos.
const rngNeutroImv = () => rngFixo(...Array(12).fill(0.5), 0.99);

test('imóveis: parcela pela tabela Price e estado inicial equilibrado', () => {
  const cfgI = config.imoveis;
  const financiado = cfgI.valorImovel * (1 - cfgI.entradaPct); // 96.000
  const parcela = regras.parcelaFinanciamento(financiado, cfgI.jurosMes, cfgI.prazoMeses);
  assert.equal(parcela, 2528);

  const comprador = regras.novoJogo({ modo: 'cenarios', cenario: 'imoveis', imoveisEscolha: 'comprar', dificuldade: 'normal' });
  const locatario = regras.novoJogo({ modo: 'cenarios', cenario: 'imoveis', imoveisEscolha: 'alugar', dificuldade: 'normal' });
  assert.equal(comprador.caixa, cfgI.capitalInicial - 24000); // pagou a entrada
  assert.equal(locatario.caixa, cfgI.capitalInicial);
  assert.equal(comprador.imoveis.carteiraAluguel, 24000); // fantasma começa com a entrada
  // A corrida começa empatada: equity do comprador ≈ entrada ≈ carteira do fantasma,
  // então o patrimônio inicial dos dois é praticamente o mesmo.
  assert.ok(Math.abs(regras.patrimonio(comprador) - regras.patrimonio(locatario)) < 5);
});

test('imóveis: mês neutro do comprador — parcela sai, imóvel valoriza, fantasma compõe', () => {
  const st = regras.novoJogo({ modo: 'cenarios', cenario: 'imoveis', imoveisEscolha: 'comprar', dificuldade: 'normal' });
  st.tela = 'jogo';
  const s = regras.fecharMes(st, { rng: rngNeutroImv() });
  // caixa: 6000 + 8000 (salário) − 3600 (custo sem moradia) − 2528 (parcela)
  assert.equal(s.caixa, 6000 + 8000 - 3600 - 2528);
  assert.equal(s.imoveis.pagas, 1);
  assert.ok(Math.abs(s.imoveis.valorImovel - 120000 * 1.015) < 1); // valorização própria
  // fantasma: 24000 × (1 + retFIIs 0.005 + div 0.028) + diferença (2528 − 1200)
  assert.ok(Math.abs(s.imoveis.carteiraAluguel - (24000 * 1.033 + 1328)) < 1);
  assert.equal(s.fim, null);
});

test('imóveis: mês neutro do locatário — só o aluguel sai do caixa real', () => {
  const st = regras.novoJogo({ modo: 'cenarios', cenario: 'imoveis', imoveisEscolha: 'alugar', dificuldade: 'normal' });
  st.tela = 'jogo';
  const s = regras.fecharMes(st, { rng: rngNeutroImv() });
  assert.equal(s.caixa, 30000 + 8000 - 3600 - 1200);
  // patrimônio do locatário NÃO inclui o imóvel nem a carteira-fantasma (é contrafactual)
  assert.ok(Math.abs(regras.patrimonio(s) - s.caixa) < 0.01);
  assert.equal(s.fim, null);
});

test('imóveis: cenário termina no prazo com comparação, e livre fica suprimido', () => {
  let s = regras.novoJogo({ modo: 'cenarios', cenario: 'imoveis', imoveisEscolha: 'comprar', dificuldade: 'normal' });
  s.tela = 'jogo';
  s.imoveis = { ...s.imoveis, prazo: 2 };
  s.ativos = { ...s.ativos, fiis: 1e6 }; // renda passiva > custo, mas não pode dar 'livre'
  s = regras.fecharMes(s, { rng: rngNeutroImv() });
  assert.equal(s.fim, null);
  s = regras.fecharMes(s, { rng: rngNeutroImv() });
  assert.equal(s.fim, 'imoveis_fim');
  assert.ok(s.log.some(l => l.texto.includes('FIM DO CENÁRIO')));
});

test('imóveis: a parcela pode te quebrar — faliu continua valendo no cenário', () => {
  const st = regras.novoJogo({ modo: 'cenarios', cenario: 'imoveis', imoveisEscolha: 'comprar', dificuldade: 'normal' });
  st.tela = 'jogo';
  st.caixa = 0;
  st.salario = 0;
  const s = regras.fecharMes(st, { rng: rngNeutroImv() });
  assert.equal(s.fim, 'faliu');
});

test('imóveis: saldo devedor zera ao quitar e o patrimônio do comprador vira o imóvel inteiro', () => {
  const s = regras.novoJogo({ modo: 'cenarios', cenario: 'imoveis', imoveisEscolha: 'comprar', dificuldade: 'normal' });
  assert.ok(Math.abs(regras.saldoDevedor(s.imoveis) - 96000) < 5); // início ≈ valor financiado
  const quitado = { ...s.imoveis, pagas: s.imoveis.prazo };
  assert.equal(regras.saldoDevedor(quitado), 0);
});

// ---------- conceitos educacionais ----------

test('conceitos: todo tooltip referencia apenas termos que existem no glossário', () => {
  for (const [id, t] of Object.entries(conceitos.tooltips)) {
    assert.ok(t.titulo && t.explicacao, id + ' precisa de título e explicação');
    assert.ok(t.termos.length > 0, id + ' precisa desbloquear pelo menos um termo');
    for (const termo of t.termos) assert.ok(conceitos.termos[termo], id + ' referencia termo inexistente: ' + termo);
  }
});

test('conceitos: os 8 termos mínimos do glossário existem, com nome e definição', () => {
  const minimos = ['cdi', 'selic', 'diversificacao', 'correlacao', 'custoOportunidade', 'volatilidade', 'marginCall', 'sequenciaRetornos'];
  for (const t of minimos) assert.ok(conceitos.termos[t], 'faltou o termo ' + t);
  for (const [id, t] of Object.entries(conceitos.termos)) {
    assert.ok(t.nome && t.definicao, 'termo ' + id + ' precisa de nome e definição');
  }
});

test('conceitos: todo termo do glossário é desbloqueável por algum tooltip', () => {
  const alcancaveis = new Set();
  for (const t of Object.values(conceitos.tooltips)) for (const termo of t.termos) alcancaveis.add(termo);
  for (const id of Object.keys(conceitos.termos)) {
    assert.ok(alcancaveis.has(id), 'termo ' + id + ' ficaria trancado pra sempre — nenhum tooltip o desbloqueia');
  }
});

test('conceitos: visto persiste, não duplica e desbloqueia os termos certos', () => {
  const st = storageFake();
  assert.equal(conceitos.jaVisto('acoes', st), false);
  conceitos.marcarVisto('acoes', st);
  conceitos.marcarVisto('acoes', st); // repetido não duplica
  conceitos.marcarVisto('reserva', st);
  assert.equal(conceitos.jaVisto('acoes', st), true);
  assert.deepEqual(conceitos.vistos(st), ['acoes', 'reserva']);
  assert.deepEqual(conceitos.termosDesbloqueados(st), ['volatilidade', 'cdi', 'selic']);
});

test('conceitos: fecharMes marca liquidacaoNoMes só quando vendeu algo à força', () => {
  // com ativos pra liquidar → flag ligada
  const aperto = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  aperto.caixa = 0;
  aperto.salario = 0;
  aperto.ativos.reserva = 10000;
  const s1 = regras.fecharMes(aperto, { rng: rngNeutro() });
  assert.equal(s1.liquidacaoNoMes, true);
  assert.equal(s1.fim, null);
  // mês tranquilo → flag desligada
  const calmo = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  const s2 = regras.fecharMes(calmo, { rng: rngNeutro() });
  assert.equal(s2.liquidacaoNoMes, false);
});

test('clássico continua com falência e liberdade intactas com os novos campos', () => {
  const quebra = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  quebra.caixa = 0;
  quebra.salario = 0;
  assert.equal(regras.fecharMes(quebra, { rng: rngNeutro() }).fim, 'faliu');
  const livre = jogoEmAndamento({ dificuldade: 'normal', salarioInicial: 4500 });
  livre.ativos.fiis = 1e6;
  assert.equal(regras.fecharMes(livre, { rng: rngNeutro() }).fim, 'livre');
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

test('placar: registro do clássico usa fim, meses e tempo real', () => {
  const s = { modo: 'classico', dificuldade: 'hardcore', fim: 'livre', mes: 30, inicioTs: 1000, fimTs: 61000 };
  const r = placar.registro(s, 50000.4, 'CLAUDIO', undefined);
  assert.equal(r.modo, 'classico');
  assert.equal(r.resultado, 'livre');
  assert.equal(r.meses, 30);
  assert.equal(r.tempo, 60);
  assert.equal(r.pat, 50000);
  assert.equal(r.dificuldade, 'hardcore');
  assert.ok(placar.vitoria(r.resultado));
});

test('placar: cenários viram boards próprios com o detalhe da variante', () => {
  const s = { modo: 'cenarios', cenario: 'imoveis', fim: 'imoveis_fim', mes: 48, imoveis: { escolha: 'alugar' } };
  const r = placar.registro(s, 300000, '', undefined);
  assert.equal(r.modo, 'imoveis');
  assert.equal(r.detalhe, 'alugar');
  assert.equal(r.nome, 'ANÔNIMO');
});

test('placar: score — vitória sempre acima de derrota; clássico premia menos meses e menos tempo', () => {
  const base = { modo: 'classico', dificuldade: 'normal', inicioTs: 0 };
  const v40 = placar.registro({ ...base, fim: 'livre', mes: 40, fimTs: 500000 }, 1, '');
  const v30 = placar.registro({ ...base, fim: 'livre', mes: 30, fimTs: 900000 }, 1, '');
  const v30rapido = placar.registro({ ...base, fim: 'livre', mes: 30, fimTs: 100000 }, 1, '');
  const derrotaLonga = placar.registro({ ...base, fim: 'faliu', mes: 9999, fimTs: 1000 }, 0, '');
  const ordem = placar.ordenar([v40, derrotaLonga, v30, v30rapido]);
  assert.deepEqual(ordem.map(r => r.tempo), [100, 900, 500, 1]);
  assert.equal(ordem[3].resultado, 'faliu');
});

test('placar: aposentadoria e imóveis rankeiam vitória por patrimônio final', () => {
  const rico = placar.registro({ modo: 'cenarios', cenario: 'aposentadoria', fim: 'apos_sucesso', mes: 84, aposentadoria: { saqueModo: 'fixo' } }, 900000, '');
  const pobre = placar.registro({ modo: 'cenarios', cenario: 'aposentadoria', fim: 'apos_sucesso', mes: 84, aposentadoria: { saqueModo: 'fixo' } }, 100, '');
  const zerou = placar.registro({ modo: 'cenarios', cenario: 'aposentadoria', fim: 'apos_faliu', mes: 70, aposentadoria: { saqueModo: 'fixo' } }, 0, '');
  assert.deepEqual(placar.ordenar([pobre, zerou, rico]).map(r => r.pat), [900000, 100, 0]);
});

test('placar: sandbox registra o marco como vitória com o capital no detalhe', () => {
  const s = { modo: 'sandbox', capitalInicial: 10000, mes: 25, inicioTs: 0, fimTs: 60000 };
  const r = placar.registro(s, 80000, 'LAB', 'marco');
  assert.equal(r.modo, 'sandbox');
  assert.equal(r.resultado, 'marco');
  assert.equal(r.detalhe, '10000');
  assert.ok(placar.vitoria('marco'));
});

test('placar: local salva e lê filtrando pelo board', () => {
  const st = storageFake();
  placar.salvar({ nome: 'A', modo: 'classico', resultado: 'livre', meses: 30, pat: 1, tempo: 60, score: 1e12 - 30e6 - 60 }, st);
  placar.salvar({ nome: 'B', modo: 'sandbox', resultado: 'marco', meses: 20, pat: 1, tempo: 60, score: 1e12 - 20e6 - 60 }, st);
  const classico = placar.ler('classico', st);
  assert.equal(classico.length, 1);
  assert.equal(classico[0].nome, 'A');
  assert.equal(classico[0].voce, true);
  assert.equal(placar.ler('sandbox', st)[0].nome, 'B');
  assert.equal(placar.ler('imoveis', st).length, 0);
});

test('placar online: sem chaves fica offline e resolve sem rede', async () => {
  assert.equal(placar.online({ url: '', anonKey: '' }), false);
  assert.equal(await placar.enviarRemoto({}, { url: '', anonKey: '' }, null), false);
  assert.equal(await placar.lerRemoto('classico', { url: '', anonKey: '' }, null), null);
});

test('placar online: envia POST com as colunas certas e lê o top do board', async () => {
  const cfg = { url: 'https://x.supabase.co/', anonKey: 'anon123', tabela: 'placar' };
  const chamadas = [];
  const fetchFake = (url, opts) => {
    chamadas.push({ url, opts });
    return Promise.resolve({ ok: true, json: () => Promise.resolve([{ nome: 'GLOBAL1' }]) });
  };
  const rec = placar.registro({ modo: 'classico', dificuldade: 'normal', fim: 'livre', mes: 30, inicioTs: 0, fimTs: 60000 }, 5000, 'EU');
  assert.equal(await placar.enviarRemoto(rec, cfg, fetchFake), true);
  assert.equal(chamadas[0].url, 'https://x.supabase.co/rest/v1/placar');
  assert.equal(chamadas[0].opts.method, 'POST');
  assert.equal(chamadas[0].opts.headers.apikey, 'anon123');
  const corpo = JSON.parse(chamadas[0].opts.body);
  assert.deepEqual(Object.keys(corpo).sort(), ['detalhe', 'dificuldade', 'meses', 'modo', 'nome', 'pat', 'resultado', 'score', 'tempo']);
  assert.equal(corpo.voce, undefined); // campos locais não vazam pro banco

  const lista = await placar.lerRemoto('classico', cfg, fetchFake);
  assert.equal(lista[0].nome, 'GLOBAL1');
  assert.ok(chamadas[1].url.includes('modo=eq.classico'));
  assert.ok(chamadas[1].url.includes('order=score.desc'));
});

test('placar online: url já com /rest/v1 não duplica o caminho', async () => {
  const chamadas = [];
  const fetchFake = (url) => { chamadas.push(url); return Promise.resolve({ ok: true, json: () => Promise.resolve([]) }); };
  // formato que o painel do Supabase mostra (com sufixo e barra final)
  const cfg = { url: 'https://abc.supabase.co/rest/v1/', anonKey: 'k', tabela: 'placar' };
  await placar.enviarRemoto(placar.registro({ modo: 'classico', dificuldade: 'normal', fim: 'livre', mes: 1, inicioTs: 0, fimTs: 0 }, 0, 'X'), cfg, fetchFake);
  await placar.lerRemoto('classico', cfg, fetchFake);
  assert.equal(chamadas[0], 'https://abc.supabase.co/rest/v1/placar');
  assert.ok(chamadas[1].startsWith('https://abc.supabase.co/rest/v1/placar?'));
  assert.ok(!chamadas[0].includes('/rest/v1/rest/v1'));
});

test('placar online: erro de rede não explode — resolve false/null', async () => {
  const cfg = { url: 'https://x.supabase.co', anonKey: 'k' };
  const fetchRuim = () => Promise.reject(new Error('offline'));
  assert.equal(await placar.enviarRemoto({}, cfg, fetchRuim), false);
  assert.equal(await placar.lerRemoto('classico', cfg, fetchRuim), null);
});

test('placar: registro sanitiza o nome (controle fora, vazio vira ANÔNIMO) e prende meses ao limite do banco', () => {
  const base = { modo: 'classico', dificuldade: 'normal', fim: 'livre', inicioTs: 0, fimTs: 60000 };
  const comControle = placar.registro({ ...base, mes: 10 }, 0, 'A' + String.fromCharCode(7, 27) + 'B');
  assert.equal(comControle.nome, 'AB');
  const soControle = placar.registro({ ...base, mes: 10 }, 0, String.fromCharCode(0, 31));
  assert.equal(soControle.nome, 'ANÔNIMO');
  const mesesAbsurdo = placar.registro({ ...base, mes: 123456 }, 0, 'X');
  assert.equal(mesesAbsurdo.meses, 9999); // CHECK do banco: meses <= 9999
});

test('aposentadoria: caixa negativo na ACUMULAÇÃO agora é FALIU (não fica devendo pra sempre)', () => {
  const st = jogoEmAndamento({ modo: 'cenarios', cenario: 'aposentadoria', dificuldade: 'normal' });
  st.caixa = 0;
  st.salario = 0;
  st.custo = 50000; // drena tudo num mês; sem ativos pra liquidar
  const s = regras.fecharMes(st, { rng: rngNeutro() });
  assert.equal(s.fim, 'faliu');
  assert.ok(s.log.some(l => l.texto.includes('FALIU antes de se aposentar')));
});

test('placar: nickname persiste truncado em 16 caracteres', () => {
  const st = storageFake();
  assert.equal(placar.nick(st), '');
  placar.salvarNick('UM_NOME_GIGANTE_DEMAIS_PRO_PLACAR', st);
  assert.equal(placar.nick(st), 'UM_NOME_GIGANTE_');
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
