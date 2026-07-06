// Regras centrais do jogo: funções puras sobre o estado plano.
// Nenhuma referência a UI, setState ou DOM — tudo testável em Node.
// A aleatoriedade entra por `rng` injetável (default Math.random).
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      require('./config.js'),
      require('./ativos.js'),
      require('./eventos.js'),
      require('./formato.js')
    );
  } else {
    root.Fluxo = root.Fluxo || {};
    root.Fluxo.regras = factory(root.Fluxo.config, root.Fluxo.ativos, root.Fluxo.eventos, root.Fluxo.formato);
  }
})(typeof window !== 'undefined' ? window : globalThis, function (config, ativos, eventos, formato) {

  const fmt = formato.fmt;

  function chavesZeradas() {
    const o = {};
    for (const d of ativos) o[d.key] = 0;
    return o;
  }

  function novoJogo(props) {
    const hard = ((props && props.dificuldade) ?? 'normal') === 'hardcore';
    const dif = config.dificuldades[hard ? 'hardcore' : 'normal'];
    const modo = (props && props.modo) || 'classico';
    const ehEmpresario = modo === 'empresario';
    const cenario = modo === 'cenarios' ? ((props && props.cenario) || 'aposentadoria') : null;
    const ehAposentadoria = cenario === 'aposentadoria';
    const cfgAp = config.aposentadoria;
    // No modo empresário não há salário: a renda vem das retiradas do negócio.
    // O custo de vida continua derivado do salário de referência.
    const salarioRef = ehAposentadoria ? cfgAp.salario : ((props && props.salarioInicial) ?? config.salarioDefault);
    const salario = ehEmpresario ? 0 : salarioRef;
    const capitalInicial = (props && props.capitalInicial) ?? null;
    const caixaBase = ehAposentadoria ? cfgAp.capitalInicial
      : capitalInicial != null ? capitalInicial : dif.caixaInicial;
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
      mes: 0,
      caixa: caixaBase,
      salario,
      custo: Math.round(salarioRef * dif.custoFator),
      semSalario: 0,
      ativos: chavesZeradas(),
      varMes: chavesZeradas(),
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

  function addLog(s, logs, texto, cor, mes) {
    logs.unshift({ id: s.proximoLogId++, mes: 'M' + String(mes).padStart(2, '0'), texto, cor });
  }

  function rendaPassiva(s) {
    return ativos.reduce((t, d) => t + s.ativos[d.key] * d.div, 0);
  }

  function patrimonio(s) {
    return s.caixa + Object.values(s.ativos).reduce((a, b) => a + b, 0) + (s.negocio ? s.negocio.caixa : 0);
  }

  function ganhoReinvestimento(nivel) {
    return Math.round(config.empresario.impulsoReceita / (1 + nivel * config.empresario.decaimento));
  }

  // PF → PJ: aporta capital de giro do caixa pessoal na empresa.
  function aportarNegocio(s, valor) {
    if (!s.negocio || s.negocio.falido) return {};
    const v = Math.min(valor, s.caixa);
    if (v < 1) return {};
    return { caixa: s.caixa - v, negocio: { ...s.negocio, caixa: s.negocio.caixa + v } };
  }

  // PJ → PF: retira lucro pro caixa pessoal (saque não deixa a empresa no vermelho).
  function sacarNegocio(s, valor) {
    if (!s.negocio || s.negocio.falido) return {};
    const v = Math.min(valor, s.negocio.caixa);
    if (v < 1) return {};
    return { caixa: s.caixa + v, negocio: { ...s.negocio, caixa: s.negocio.caixa - v } };
  }

  // Reinveste um passo fixo: aumenta a receita base com retornos decrescentes.
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

  // Aporte (valor > 0, limitado ao caixa) ou resgate (valor < 0, limitado ao saldo).
  // Retorna o update parcial de estado ({} = nada a fazer).
  function mover(s, key, valor) {
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

  // Cobre déficit liquidando na ordem de config.liquidacao; retorna o que faltou.
  function cobrir(s, deficit, logs) {
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

  // Saque planejado (aposentadoria): puxa do caixa e depois dos ativos a VALOR JUSTO
  // (sem deságio — não é liquidação de pânico), na ordem segura-primeiro.
  // Retorna quanto faltou (> 0 = patrimônio esgotado).
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

  // Resolve um turno completo e retorna o novo estado (não muta `st`).
  function fecharMes(st, opts) {
    const rng = (opts && opts.rng) || Math.random;
    const s = { ...st, ativos: { ...st.ativos }, varMes: {}, log: [...st.log], hist: [...st.hist] };
    if (st.negocio) s.negocio = { ...st.negocio };
    if (st.aposentadoria) s.aposentadoria = { ...st.aposentadoria };
    const logs = s.log;
    s.mes += 1;
    s.pendente = 0;

    // Na fase de saque não há salário nem custo mensal: o saque É o custo de vida.
    const emSaque = !!(st.aposentadoria && st.aposentadoria.fase === 'saque');

    // salário e custo
    if (!emSaque) {
      if (s.semSalario > 0) { s.semSalario -= 1; addLog(s, logs, '✖ Mês sem salário (' + (s.semSalario + 1) + ' restante).', '#ff9d4b', s.mes); }
      else s.caixa += s.salario;
      s.caixa -= s.custo;
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

    // retornos de mercado
    let divTotal = 0;
    for (const d of ativos) {
      const r = d.ret + d.vol * (rng() + rng() - 1);
      s.ativos[d.key] *= (1 + r);
      s.varMes[d.key] = r;
      divTotal += s.ativos[d.key] * d.div;
    }
    if (divTotal >= 1) { s.caixa += divTotal; addLog(s, logs, '● Renda passiva recebida: +' + fmt(divTotal) + '.', '#22d47e', s.mes); }

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
      // evento aleatório
      eventos.sortear(s, logs, { rng, addLog });
      if (s.pendente) s.caixa -= s.pendente;
    }

    // inflação de base
    const dif = config.dificuldades[s.hard ? 'hardcore' : 'normal'];
    s.custo = Math.round(s.custo * dif.inflacaoBase);

    // progressão de carreira anual (só faz sentido com salário)
    if (s.salario > 0 && s.mes % 12 === 0 && s.semSalario === 0) {
      s.salario = Math.round(s.salario * config.progressaoAnual);
      addLog(s, logs, '▲ PROGRESSÃO ANUAL. Salário agora ' + fmt(s.salario) + '. Aumente o aporte, não o padrão de vida.', '#22d47e', s.mes);
    }

    // caixa negativo → liquidação em cascata; empresário ainda pode raspar o caixa da empresa
    if (s.caixa < 0) {
      let falta = cobrir(s, -s.caixa, logs);
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
      } else if (s.mes >= ap.turnosAcumulacao) {
        ap.fase = 'saque';
        s.salario = 0;
        const desc = ap.saqueModo === 'percentual' ? (ap.taxaSaque * 100).toFixed(0) + '% do patrimônio/mês' : 'seu custo de vida (' + fmt(s.custo) + '/mês)';
        addLog(s, logs, '◆ FIM DA ACUMULAÇÃO (' + ap.turnosAcumulacao + ' meses). Agora você vive só do patrimônio, sacando ' + desc + '. Aguente ' + ap.turnosSaque + ' meses — a ORDEM dos retornos vai decidir.', '#ffc24b', s.mes);
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
    return s;
  }

  return {
    novoJogo, addLog, rendaPassiva, patrimonio, mover, cobrir, fecharMes,
    aportarNegocio, sacarNegocio, reinvestirNegocio, ganhoReinvestimento,
    sacarPortfolio,
  };
});
