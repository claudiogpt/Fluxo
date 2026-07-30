/**
 * @file Regras centrais do jogo: funções puras sobre estado plano.
 * Sem UI, DOM ou Redux — testável em Node com `rng` injetável.
 * @typedef {import('./typedefs.jsdoc').GameState} GameState
 * @typedef {import('./typedefs.jsdoc').NovoJogoProps} NovoJogoProps
 * @typedef {import('./typedefs.jsdoc').AtivoKey} AtivoKey
 * @typedef {import('./typedefs.jsdoc').EstadoImoveis} EstadoImoveis
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      require('./config.js'),
      require('./ativos.js'),
      require('./eventos.js'),
      require('./formato.js'),
      require('./catalogo.js'),
      require('./realista.js')
    );
  } else {
    root.Fluxo = root.Fluxo || {};
    root.Fluxo.regras = factory(root.Fluxo.config, root.Fluxo.ativos, root.Fluxo.eventos, root.Fluxo.formato, root.Fluxo.catalogo, root.Fluxo.realista);
  }
})(typeof window !== 'undefined' ? window : globalThis, function (config, ativos, eventos, formato, catalogo, realista) {

  const fmt = formato.fmt;

  /**
   * Cria mapa de saldos zerados para uma lista de definições de ativo.
   *
   * Recebe as defs em vez de ler `ativos` direto porque o modo realista tem
   * catálogo próprio (`catalogo.defs`): quem decide a lista é `defsDoModo`.
   *
   * @param {Array<{key: string}>} [defs] - Asset definitions (defaults to the classic five).
   * @returns {Record<string, number>} All asset keys at zero.
   */
  function chavesZeradas(defs) {
    const o = {};
    for (const d of (defs || ativos)) o[d.key] = 0;
    return o;
  }

  /**
   * Lista de ativos que vale para este estado.
   *
   * É o único ponto que decide entre os 5 ativos genéricos e o catálogo de 15
   * do realista — todo laço sobre ativos passa por aqui.
   *
   * @param {GameState} s - Current game state.
   * @returns {Array<Object>} Asset definitions for this mode.
   */
  function defsDoModo(s) {
    return s.realista ? catalogo.defs : ativos;
  }

  /**
   * Cria um estado inicial de partida a partir das escolhas do menu.
   *
   * Monta caixa, salário e sub-estados (aposentadoria, imóveis, empresário)
   * conforme modo e cenário. A partida começa com `tela: 'intro'`.
   *
   * @param {NovoJogoProps} [props] - Menu choices (difficulty, mode, capital).
   * @returns {GameState} Fresh game state ready for `comecar`.
   *
   * @example
   * const s = novoJogo({ dificuldade: 'hardcore', modo: 'classico' });
   */
  function novoJogo(props) {
    const modo = (props && props.modo) || 'classico';
    // Tutorial roda sempre no normal: a primeira partida de alguém não é lugar
    // de hardcore, e ele não escolheu dificuldade nenhuma pra chegar aqui.
    const ehTutorial = modo === 'tutorial';
    const hard = !ehTutorial && ((props && props.dificuldade) ?? 'normal') === 'hardcore';
    const dif = config.dificuldades[hard ? 'hardcore' : 'normal'];
    const ehEmpresario = modo === 'empresario';
    const cenario = modo === 'cenarios' ? ((props && props.cenario) || 'aposentadoria') : null;
    // Treino é um CENÁRIO: mesmo modo, mesmo board, mesma tela de setup. O que
    // ele traz de diferente (posição inicial, roteiro, prazo) é tudo dado.
    const treino = cenario ? (config.treinos || []).find(function (t) { return t.id === cenario; }) || null : null;
    const ehAposentadoria = cenario === 'aposentadoria';
    const ehImoveis = cenario === 'imoveis';
    const ehRealista = modo === 'realista';
    const cfgR = config.realista;
    const cfgAp = config.aposentadoria;
    const cfgI = config.imoveis;
    const imoveisEscolha = (props && props.imoveisEscolha) || 'comprar';
    const entradaImovel = Math.round(cfgI.valorImovel * cfgI.entradaPct);
    // No modo empresário não há salário: a renda vem das retiradas do negócio.
    // O custo de vida continua derivado do salário de referência.
    const salarioRef = ehAposentadoria ? cfgAp.salario
      : ehImoveis ? cfgI.salario
      : ehRealista ? cfgR.salario
      : ((props && props.salarioInicial) ?? config.salarioDefault);
    const salario = ehEmpresario ? 0 : (treino && treino.salario != null ? treino.salario : salarioRef);
    const capitalInicial = (props && props.capitalInicial) ?? null;
    const caixaBase = ehAposentadoria ? cfgAp.capitalInicial
      : ehImoveis ? cfgI.capitalInicial - (imoveisEscolha === 'comprar' ? entradaImovel : 0)
      : ehRealista ? cfgR.caixaInicial
      : treino && treino.caixaInicial != null ? treino.caixaInicial
      : capitalInicial != null ? capitalInicial : dif.caixaInicial;
    // O modo realista tem catálogo próprio: 15 ativos em vez dos 5 de ativos.js.
    const defs = ehRealista ? catalogo.defs : ativos;
    // Treino começa alocado — a posição difícil é o enunciado do exercício.
    // Chave que não existe no modo é ignorada em vez de criar ativo fantasma.
    const saldos = chavesZeradas(defs);
    if (treino && treino.alocacaoInicial) {
      for (const k in treino.alocacaoInicial) {
        if (k in saldos) saldos[k] = treino.alocacaoInicial[k];
      }
    }
    return {
      tela: 'intro',
      dificuldade: hard ? 'hardcore' : 'normal',
      modo,
      cenario,
      capitalInicial,
      // Cenário aposentadoria: fase de acumulação → fase de saque automático.
      aposentadoria: ehAposentadoria ? {
        fase: 'acumulacao',
        saqueModo: (props && props.saqueModo) || 'fixo', // 'fixo' (= custo de vida) | 'percentual'
        taxaSaque: cfgAp.taxaSaque,
        turnosAcumulacao: cfgAp.turnosAcumulacao,
        turnosSaque: cfgAp.turnosSaque,
        saquesFeitos: 0,   // meses de saque sobrevividos
        saqueMes: 0,       // valor sacado no último mês (pra UI)
        esgotou: false,
      } : null,
      // Cenário imóveis: a "corrida" — o comprador acumula patrimônio no imóvel,
      // a carteira-fantasma mostra a estratégia oposta com os MESMOS retornos.
      imoveis: ehImoveis ? {
        escolha: imoveisEscolha,
        prazo: cfgI.prazoMeses,
        pagas: 0,
        parcela: parcelaFinanciamento(cfgI.valorImovel - entradaImovel, cfgI.jurosMes, cfgI.prazoMeses),
        aluguel: cfgI.aluguel,
        valorImovel: cfgI.valorImovel,
        carteiraAluguel: entradaImovel, // fantasma começa com a entrada investida
        varImovelMes: 0,
      } : null,
      negocio: ehEmpresario ? {
        caixa: config.empresario.caixaInicial,
        receitaBase: config.empresario.receitaBase,
        custoFixo: config.empresario.custoFixo,
        nivel: 0,
        mesesNoVermelho: 0,
        falido: false,
        receitaMes: null,
        varReceitaMes: 0,
      } : null,
      // Modo realista: macro viva + uma posição por ativo do catálogo (saldo,
      // custo de aquisição e idade média — o que o IR e a carência precisam).
      realista: ehRealista ? realista.novoEstado(props && props.macroInicial) : null,
      mes: 0,
      caixa: caixaBase,
      salario,
      // No cenário imóveis o custo de vida EXCLUI moradia (a moradia é a decisão do cenário).
      custo: Math.round(salarioRef * (ehImoveis ? cfgI.custoFator : ehRealista ? cfgR.custoFator : dif.custoFator)),
      semSalario: 0,
      // Prazo da partida (tutorial e treinos). null = joga até vencer ou quebrar.
      desafio: ehTutorial ? { meses: config.tutorial.meses } : (treino && treino.desafio) || null,
      // Eventos com hora marcada. Ver eventos.roteirar.
      roteiro: (treino && treino.roteiro) || null,
      ativos: saldos,
      varMes: chavesZeradas(defs),
      hist: [],
      log: [{ id: 0, mes: 'M00', texto: 'Sistema iniciado. Sobreviva. Diversifique. Não conte com sorte.', cor: '#6b7c8c' }],
      fim: null,
      hard,
      auto: false,
      inicioTs: null,
      fimTs: null,
      agora: 0,
      proximoLogId: 1,
    };
  }

  /**
   * Insere entrada no log do turno (mais recente primeiro).
   *
   * @param {GameState} s - State whose `proximoLogId` is incremented.
   * @param {LogItem[]} logs - Mutable log array (usually `s.log`).
   * @param {string} texto - Message shown in the event terminal.
   * @param {string} cor - Hex color from engine palette.
   * @param {number} mes - Current month number for the Mxx label.
   */
  function addLog(s, logs, texto, cor, mes) {
    logs.unshift({ id: s.proximoLogId++, mes: 'M' + String(mes).padStart(2, '0'), texto, cor });
  }

  /**
   * Calcula renda passiva mensal (dividendos dos ativos × saldos).
   *
   * @param {GameState} s - Current game state.
   * @returns {number} Monthly passive income in BRL.
   */
  function rendaPassiva(s) {
    return defsDoModo(s).reduce((t, d) => t + s.ativos[d.key] * d.div, 0);
  }

  /**
   * Calcula parcela fixa mensal (tabela Price).
   *
   * @param {number} principal - Financed amount in BRL.
   * @param {number} jurosMes - Monthly interest rate (decimal).
   * @param {number} prazo - Number of installments.
   * @returns {number} Rounded monthly payment in BRL.
   */
  function parcelaFinanciamento(principal, jurosMes, prazo) {
    return Math.round(principal * jurosMes / (1 - Math.pow(1 + jurosMes, -prazo)));
  }

  /**
   * Calcula saldo devedor restante do financiamento imobiliário.
   *
   * Usado no patrimônio do comprador e na carteira-fantasma do cenário imóveis.
   *
   * @param {EstadoImoveis} im - Real-estate sub-state.
   * @returns {number} Remaining debt in BRL (0 if paid off).
   */
  function saldoDevedor(im) {
    const rest = im.prazo - im.pagas;
    if (rest <= 0) return 0;
    const i = config.imoveis.jurosMes;
    return im.parcela * (1 - Math.pow(1 + i, -rest)) / i;
  }

  /**
   * Soma patrimônio total: caixa + ativos + negócio + equity imóvel.
   *
   * @param {GameState} s - Current game state.
   * @returns {number} Net worth in BRL.
   */
  function patrimonio(s) {
    // No cenário imóveis, o comprador tem patrimônio no imóvel = valor − saldo devedor.
    const imovel = s.imoveis && s.imoveis.escolha === 'comprar'
      ? s.imoveis.valorImovel - saldoDevedor(s.imoveis) : 0;
    return s.caixa + Object.values(s.ativos).reduce((a, b) => a + b, 0)
      + (s.negocio ? s.negocio.caixa : 0) + imovel;
  }

  /**
   * Retorna ganho de receita ao reinvestir no negócio (retornos decrescentes).
   *
   * @param {number} nivel - Current reinvestment level (0-based).
   * @returns {number} Revenue bump in BRL for the next level.
   */
  function ganhoReinvestimento(nivel) {
    return Math.round(config.empresario.impulsoReceita / (1 + nivel * config.empresario.decaimento));
  }

  /**
   * Transfere capital do caixa pessoal para o caixa da empresa (PF → PJ).
   *
   * @param {GameState} s - Current game state.
   * @param {number} valor - Amount to transfer in BRL.
   * @returns {Partial<GameState>} Updated fields, or `{}` if noop.
   */
  function aportarNegocio(s, valor) {
    if (!s.negocio || s.negocio.falido) return {};
    const v = Math.min(valor, s.caixa);
    if (v < 1) return {};
    return { caixa: s.caixa - v, negocio: { ...s.negocio, caixa: s.negocio.caixa + v } };
  }

  /**
   * Transfere capital da empresa para o caixa pessoal (PJ → PF).
   *
   * Não permite deixar a empresa com caixa negativo.
   *
   * @param {GameState} s - Current game state.
   * @param {number} valor - Amount to withdraw in BRL.
   * @returns {Partial<GameState>} Updated fields, or `{}` if noop.
   */
  function sacarNegocio(s, valor) {
    if (!s.negocio || s.negocio.falido) return {};
    const v = Math.min(valor, s.negocio.caixa);
    if (v < 1) return {};
    return { caixa: s.caixa + v, negocio: { ...s.negocio, caixa: s.negocio.caixa - v } };
  }

  /**
   * Reinveste um passo fixo no negócio, aumentando a receita base.
   *
   * @param {GameState} s - Current game state.
   * @returns {Partial<GameState>} Updated `negocio`, or `{}` if insufficient cash.
   */
  function reinvestirNegocio(s) {
    if (!s.negocio || s.negocio.falido) return {};
    const cfgE = config.empresario;
    if (s.negocio.caixa < cfgE.reinvestimentoPasso) return {};
    return {
      negocio: {
        ...s.negocio,
        caixa: s.negocio.caixa - cfgE.reinvestimentoPasso,
        receitaBase: s.negocio.receitaBase + ganhoReinvestimento(s.negocio.nivel),
        nivel: s.negocio.nivel + 1,
      },
    };
  }

  /**
   * Move valor entre caixa e um ativo (positivo = aporte, negativo = resgate).
   *
   * Ignora movimentos menores que R$ 1 ou que esvaziariam o pote de origem.
   * Retorna parcial para merge no slice — `{}` significa no-op.
   *
   * @param {GameState} s - Current game state (not mutated; slice clones first).
   * @param {AtivoKey} key - Asset bucket key.
   * @param {number} valor - Signed amount in BRL (positive = buy).
   * @returns {Partial<GameState>} Fields to merge, or `{}` if noop.
   */
  function mover(s, key, valor) {
    // O realista precisa manter custo médio e idade dos aportes junto da ordem.
    if (s.realista) return realista.mover(s, key, valor);
    const a = { ...s.ativos };
    let v = valor;
    if (v > 0) {
      v = Math.min(v, s.caixa);
      if (v < 1) return {};
      a[key] += v;
      return { ativos: a, caixa: s.caixa - v };
    }
    v = Math.min(-v, a[key]);
    if (v < 1) return {};
    a[key] -= v;
    return { ativos: a, caixa: s.caixa + v };
  }

  /**
   * Liquida ativos em cascata para cobrir déficit de caixa (com deságio).
   *
   * Ordem definida em `config.liquidacao`. Muta `s.ativos` in place.
   *
   * @param {GameState} s - Working copy of game state.
   * @param {number} deficit - Shortfall in BRL to cover.
   * @param {LogItem[]} logs - Log array for forced-sale messages.
   * @returns {number} Remaining uncovered amount (> 0 = still broke).
   */
  function cobrir(s, deficit, logs) {
    // config.liquidacao só conhece as 5 chaves antigas: no realista ele não
    // acharia nada, cobriria R$ 0 e o jogador quebraria com a carteira cheia.
    if (s.realista) {
      return realista.cobrir(s, deficit, function (msg, cor) { addLog(s, logs, msg, cor, s.mes); });
    }
    for (const [k, fator, msg] of config.liquidacao) {
      if (deficit <= 0) break;
      if (s.ativos[k] < 1) continue;
      const bruto = Math.min(s.ativos[k], deficit / fator);
      s.ativos[k] -= bruto;
      const liquido = bruto * fator;
      deficit -= liquido;
      addLog(s, logs, '⚠ ' + msg + ' (−' + fmt(bruto) + ')', k === 'reserva' ? '#ffc24b' : '#ff9d4b', s.mes);
    }
    return deficit;
  }

  /**
   * Saca valor do patrimônio a valor justo (fase de aposentadoria).
   *
   * Drena caixa primeiro, depois ativos na ordem segura-primeiro, sem deságio.
   * Muta `s` in place.
   *
   * @param {GameState} s - Working copy of game state.
   * @param {number} valor - Withdrawal amount in BRL.
   * @returns {number} Uncovered amount (> 0.5 = portfolio exhausted).
   */
  function sacarPortfolio(s, valor) {
    let falta = valor;
    const doCaixa = Math.min(Math.max(s.caixa, 0), falta);
    s.caixa -= doCaixa;
    falta -= doCaixa;
    for (const [k] of config.liquidacao) {
      if (falta <= 0) break;
      if (s.ativos[k] < 1) continue;
      const vende = Math.min(s.ativos[k], falta);
      s.ativos[k] -= vende;
      falta -= vende;
    }
    return falta;
  }

  /**
   * Avança um turno (mês) completo e retorna o novo estado.
   *
   * Ordem das fases: salário/custo → moradia → negócio → valorização imóvel →
   * retornos de mercado → dividendos → saque ou evento → inflação → progressão
   * anual → liquidação forçada → checagem FALIU/LIVRE.
   *
   * Clona `st` internamente — o argumento original não é mutado.
   *
   * @param {GameState} st - State at end of current month (before advance).
   * @param {Object} [opts] - Options.
   * @param {() => number} [opts.rng] - Injectable RNG (default `Math.random`).
   * @returns {GameState} Complete new state after the month closes.
   *
   * @example
   * const depois = fecharMes(antes, { rng: () => 0.5 });
   */
  function fecharMes(st, opts) {
    const rng = (opts && opts.rng) || Math.random;
    const s = { ...st, ativos: { ...st.ativos }, varMes: {}, log: [...st.log], hist: [...st.hist] };
    if (st.negocio) s.negocio = { ...st.negocio };
    if (st.aposentadoria) s.aposentadoria = { ...st.aposentadoria };
    if (st.imoveis) s.imoveis = { ...st.imoveis };
    // Spread raso não serve aqui: `posicoes` ficaria compartilhado com o
    // argumento e este mês passaria a mutar a entrada. Ver realista.clonar.
    if (st.realista) s.realista = realista.clonar(st.realista);
    const logs = s.log;
    // Fecha a conta do mês que está terminando ANTES de virar o número: o IR
    // pago nas vendas deste mês aparece no log com o mês em que aconteceu, e
    // os tetos de isenção zeram pro mês seguinte.
    if (s.realista) realista.fecharContaDoMes(s, function (msg, cor) { addLog(s, logs, msg, cor, s.mes); });
    s.mes += 1;
    s.pendente = 0;
    s.liquidacaoNoMes = false;

    // Na fase de saque não há salário nem custo mensal: o saque É o custo de vida.
    const emSaque = !!(st.aposentadoria && st.aposentadoria.fase === 'saque');

    // salário e custo
    if (!emSaque) {
      if (s.semSalario > 0) { s.semSalario -= 1; addLog(s, logs, '✖ Mês sem salário (' + (s.semSalario + 1) + ' restante).', '#ff9d4b', s.mes); }
      else s.caixa += s.salario;
      s.caixa -= s.custo;
    }

    // moradia (cenário imóveis): parcela do financiamento OU aluguel sai do caixa;
    // `pagas` avança sempre — serve de cronograma pro comprador real ou fantasma.
    if (s.imoveis) {
      const im = s.imoveis;
      if (im.pagas < im.prazo) {
        im.pagas += 1;
        if (im.escolha === 'comprar') s.caixa -= im.parcela;
      }
      if (im.escolha === 'alugar') s.caixa -= im.aluguel;
    }

    // negócio (modo empresário): receita com variância, custos fixos e risco próprio
    if (s.negocio && !s.negocio.falido) {
      const cfgE = config.empresario;
      const n = s.negocio;
      const varReceita = cfgE.volReceita * (rng() + rng() - 1);
      const receita = Math.round(n.receitaBase * (1 + varReceita));
      n.caixa += receita - n.custoFixo;
      n.receitaMes = receita;
      n.varReceitaMes = varReceita;
      if (n.caixa < 0) {
        n.mesesNoVermelho += 1;
        if (n.mesesNoVermelho >= cfgE.mesesFalencia) {
          n.falido = true;
          n.caixa = 0;
          n.receitaBase = 0;
          addLog(s, logs, '■ SEU NEGÓCIO FALIU após ' + cfgE.mesesFalencia + ' meses no vermelho. As dívidas morrem com o CNPJ — sua vida e seus investimentos continuam.', '#ff4d5e', s.mes);
        } else {
          addLog(s, logs, '⚠ Caixa da empresa no vermelho (' + n.mesesNoVermelho + '/' + cfgE.mesesFalencia + '). Aporte capital de giro ou corte a sangria.', '#ff9d4b', s.mes);
        }
      } else {
        n.mesesNoVermelho = 0;
      }
    }

    // valorização do imóvel (cenário imóveis) — taxa própria, fora do mercado de ativos
    if (s.imoveis) {
      const cfgI = config.imoveis;
      const vi = cfgI.valorizacaoMes + cfgI.volImovel * (rng() + rng() - 1);
      s.imoveis.valorImovel *= (1 + vi);
      s.imoveis.varImovelMes = vi;
    }

    // retornos de mercado
    let divTotal = 0;
    if (s.realista) {
      // O realista tem mercado próprio: indexadores, fatores comuns e macro.
      divTotal = realista.mercado(s, rng);
      // Depois do mercado: taxa de administração e come-cotas saem do saldo já
      // rendido, e os papéis com prazo vencem pelo valor na curva.
      const avisar = function (msg, cor) { addLog(s, logs, msg, cor, s.mes); };
      realista.custosDoMes(s, avisar);
      realista.vencimentos(s, avisar);
    } else {
      for (const d of defsDoModo(s)) {
        const r = d.ret + d.vol * (rng() + rng() - 1);
        s.ativos[d.key] *= (1 + r);
        s.varMes[d.key] = r;
        divTotal += s.ativos[d.key] * d.div;
      }
    }
    if (divTotal >= 1) { s.caixa += divTotal; addLog(s, logs, '● Renda passiva recebida: +' + fmt(divTotal) + '.', '#22d47e', s.mes); }

    // carteira-fantasma do cenário imóveis: rende como FIIs (dividendos reinvestidos)
    // com os MESMOS retornos deste mês, e aporta a diferença parcela−aluguel.
    if (s.imoveis) {
      const fii = ativos.find(a => a.key === 'fiis');
      const im = s.imoveis;
      im.carteiraAluguel *= (1 + (s.varMes.fiis || 0) + fii.div);
      if (s.mes <= im.prazo) im.carteiraAluguel += Math.max(0, im.parcela - im.aluguel);
    }

    // saque de aposentadoria (depois dos retornos do mês): vive-se o mês, então saca-se.
    // Eventos ficam desligados nesta fase pra isolar a lição do risco de sequência de retornos.
    if (emSaque) {
      const ap = s.aposentadoria;
      const W = ap.saqueModo === 'percentual' ? Math.round(patrimonio(s) * ap.taxaSaque) : s.custo;
      ap.saqueMes = W;
      const falta = sacarPortfolio(s, W);
      ap.esgotou = falta > 0.5;
      addLog(s, logs, '↓ Saque do mês: −' + fmt(W - falta) + (ap.esgotou ? ' — e o patrimônio ACABOU.' : '.'), ap.esgotou ? '#ff4d5e' : '#8fa1b2', s.mes);
    } else {
      // roteiro do treino primeiro: a cena marcada acontece, e o acaso vem por cima
      eventos.roteirar(s, logs, { rng, addLog });
      // evento aleatório
      eventos.sortear(s, logs, { rng, addLog });
      if (s.pendente) s.caixa -= s.pendente;
    }

    // inflação de base — no realista quem corrói o custo de vida é o IPCA do
    // próprio jogo, que se move: a inflação deixa de ser um número fixo da
    // dificuldade e passa a ser a mesma que o Tesouro IPCA+ está pagando.
    const dif = config.dificuldades[s.hard ? 'hardcore' : 'normal'];
    s.custo = Math.round(s.custo * (s.realista
      ? 1 + realista.mensal(s.realista.macro.ipca)
      : dif.inflacaoBase));

    // progressão de carreira anual (só faz sentido com salário)
    if (s.salario > 0 && s.mes % 12 === 0 && s.semSalario === 0) {
      s.salario = Math.round(s.salario * config.progressaoAnual);
      addLog(s, logs, '▲ PROGRESSÃO ANUAL. Salário agora ' + fmt(s.salario) + '. Aumente o aporte, não o padrão de vida.', '#22d47e', s.mes);
    }

    // caixa negativo → liquidação em cascata; empresário ainda pode raspar o caixa da empresa
    if (s.caixa < 0) {
      const deficit = -s.caixa;
      let falta = cobrir(s, deficit, logs);
      s.liquidacaoNoMes = falta < deficit - 0.5; // vendeu algo à força este mês
      if (falta > 0 && s.negocio && !s.negocio.falido && s.negocio.caixa > 0) {
        const retirada = Math.min(s.negocio.caixa, falta);
        s.negocio.caixa -= retirada;
        falta -= retirada;
        addLog(s, logs, '⚠ Retirada forçada do caixa da empresa (−' + fmt(retirada) + '). Capital de giro em risco.', '#ff9d4b', s.mes);
      }
      s.caixa = falta > 0 ? -falta : 0;
    }

    s.hist.push(patrimonio(s));
    if (s.log.length > config.logMax) s.log.length = config.logMax;

    // fim de jogo — o sandbox não tem derrota nem encerramento, só marcos no log
    const rp = rendaPassiva(s);
    if (s.aposentadoria) {
      const ap = s.aposentadoria;
      if (emSaque) {
        if (ap.esgotou) {
          s.fim = 'apos_faliu';
          s.fimTs = Date.now();
          s.auto = false;
          addLog(s, logs, '■ APOSENTADORIA ENCERRADA. Seu patrimônio durou ' + ap.saquesFeitos + ' de ' + ap.turnosSaque + ' meses de saque.', '#ff4d5e', s.mes);
        } else {
          ap.saquesFeitos += 1;
          if (ap.saquesFeitos >= ap.turnosSaque) {
            s.fim = 'apos_sucesso';
            s.fimTs = Date.now();
            s.auto = false;
            addLog(s, logs, '■ APOSENTADORIA COMPLETA! Seu patrimônio sustentou todos os ' + ap.turnosSaque + ' meses de saque.', '#22d47e', s.mes);
          }
        }
      } else if (s.caixa < 0) {
        // Falência pessoal vale na acumulação: liquidou tudo e ainda deve.
        s.fim = 'faliu';
        s.fimTs = Date.now();
        s.auto = false;
        addLog(s, logs, '■ FALIU antes de se aposentar. As contas engoliram tudo na fase de acumulação.', '#ff4d5e', s.mes);
      } else if (s.mes >= ap.turnosAcumulacao) {
        ap.fase = 'saque';
        s.salario = 0;
        const desc = ap.saqueModo === 'percentual' ? (ap.taxaSaque * 100).toFixed(0) + '% do patrimônio/mês' : 'seu custo de vida (' + fmt(s.custo) + '/mês)';
        addLog(s, logs, '◆ FIM DA ACUMULAÇÃO (' + ap.turnosAcumulacao + ' meses). Agora você vive só do patrimônio, sacando ' + desc + '. Aguente ' + ap.turnosSaque + ' meses — a ORDEM dos retornos vai decidir.', '#ffc24b', s.mes);
      }
    } else if (s.imoveis) {
      // Falência pessoal continua valendo (parcela aperta!); "livre" espera o cenário acabar.
      if (s.caixa < 0) {
        s.fim = 'faliu';
        s.fimTs = Date.now();
        s.auto = false;
        addLog(s, logs, '■ FALIU. A moradia engoliu seu caixa e não sobrou nada pra vender.', '#ff4d5e', s.mes);
      } else if (s.mes >= s.imoveis.prazo) {
        s.fim = 'imoveis_fim';
        s.fimTs = Date.now();
        s.auto = false;
        addLog(s, logs, '■ FIM DO CENÁRIO: ' + s.imoveis.prazo + ' meses. Hora de comparar as duas estratégias lado a lado.', '#ffc24b', s.mes);
      }
    } else if (s.modo === 'sandbox') {
      if (s.caixa < 0 && st.caixa >= 0) {
        addLog(s, logs, '⚠ CAIXA NEGATIVO. No modo clássico isso seria FALIU — aqui a simulação segue. Volte pro azul.', '#ff4d5e', s.mes);
      }
      if (rp >= s.custo && !s.marcoLivre) {
        s.marcoLivre = true;
        addLog(s, logs, '★ MARCO: sua renda passiva já paga seu custo de vida. No modo clássico, você estaria LIVRE.', '#22d47e', s.mes);
      }
    } else if (s.caixa < 0) {
      s.fim = 'faliu';
      s.fimTs = Date.now();
      s.auto = false;
      addLog(s, logs, '■ FALIU. As contas venceram e não sobrou nada pra vender.', '#ff4d5e', s.mes);
    } else if (rp >= s.custo) {
      s.fim = 'livre';
      s.fimTs = Date.now();
      s.auto = false;
      addLog(s, logs, '■ INDEPENDÊNCIA FINANCEIRA. Sua renda passiva paga sua vida.', '#22d47e', s.mes);
    }

    // Prazo do desafio (tutorial e treinos). Vem DEPOIS da cadeia: quebrar no
    // último mês continua sendo quebrar, e quem venceu antes venceu de verdade.
    if (!s.fim && s.desafio && s.mes >= s.desafio.meses) {
      const bateu = s.desafio.meta == null || patrimonio(s) >= s.desafio.meta;
      s.fim = bateu ? 'desafio_ok' : 'desafio_falhou';
      s.fimTs = Date.now();
      s.auto = false;
      addLog(s, logs, bateu
        ? '■ DESAFIO CUMPRIDO. Você atravessou os ' + s.desafio.meses + ' meses.'
        : '■ PRAZO ENCERRADO. Os ' + s.desafio.meses + ' meses acabaram sem bater a meta.',
        bateu ? '#22d47e' : '#ffc24b', s.mes);
    }
    return s;
  }

  return {
    novoJogo, addLog, rendaPassiva, patrimonio, mover, cobrir, fecharMes,
    aportarNegocio, sacarNegocio, reinvestirNegocio, ganhoReinvestimento,
    sacarPortfolio, parcelaFinanciamento, saldoDevedor,
  };
});
