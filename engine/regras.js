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
    const salario = (props && props.salarioInicial) ?? config.salarioDefault;
    return {
      tela: 'intro',
      dificuldade: hard ? 'hardcore' : 'normal',
      modo: 'classico',
      mes: 0,
      caixa: dif.caixaInicial,
      salario,
      custo: Math.round(salario * dif.custoFator),
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
    return s.caixa + Object.values(s.ativos).reduce((a, b) => a + b, 0);
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

  // Resolve um turno completo e retorna o novo estado (não muta `st`).
  function fecharMes(st, opts) {
    const rng = (opts && opts.rng) || Math.random;
    const s = { ...st, ativos: { ...st.ativos }, varMes: {}, log: [...st.log], hist: [...st.hist] };
    const logs = s.log;
    s.mes += 1;
    s.pendente = 0;

    // salário e custo
    if (s.semSalario > 0) { s.semSalario -= 1; addLog(s, logs, '✖ Mês sem salário (' + (s.semSalario + 1) + ' restante).', '#ff9d4b', s.mes); }
    else s.caixa += s.salario;
    s.caixa -= s.custo;

    // retornos de mercado
    let divTotal = 0;
    for (const d of ativos) {
      const r = d.ret + d.vol * (rng() + rng() - 1);
      s.ativos[d.key] *= (1 + r);
      s.varMes[d.key] = r;
      divTotal += s.ativos[d.key] * d.div;
    }
    if (divTotal >= 1) { s.caixa += divTotal; addLog(s, logs, '● Renda passiva recebida: +' + fmt(divTotal) + '.', '#22d47e', s.mes); }

    // evento aleatório
    eventos.sortear(s, logs, { rng, addLog });
    if (s.pendente) s.caixa -= s.pendente;

    // inflação de base
    const dif = config.dificuldades[s.hard ? 'hardcore' : 'normal'];
    s.custo = Math.round(s.custo * dif.inflacaoBase);

    // progressão de carreira anual
    if (s.mes % 12 === 0 && s.semSalario === 0) {
      s.salario = Math.round(s.salario * config.progressaoAnual);
      addLog(s, logs, '▲ PROGRESSÃO ANUAL. Salário agora ' + fmt(s.salario) + '. Aumente o aporte, não o padrão de vida.', '#22d47e', s.mes);
    }

    // caixa negativo → liquidação em cascata
    if (s.caixa < 0) {
      const falta = cobrir(s, -s.caixa, logs);
      s.caixa = falta > 0 ? -falta : 0;
    }

    s.hist.push(patrimonio(s));
    if (s.log.length > config.logMax) s.log.length = config.logMax;

    // fim de jogo
    const rp = rendaPassiva(s);
    if (s.caixa < 0) {
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

  return { novoJogo, addLog, rendaPassiva, patrimonio, mover, cobrir, fecharMes };
});
