/**
 * @file Tipos JSDoc espelhando src/engine/types.ts.
 * Referenciado pelos módulos engine/*.js para hover no editor.
 * A fonte da verdade da lógica continua no JS; types.ts é o contrato TypeScript.
 */

/**
 * @typedef {'reserva'|'rendafixa'|'fiis'|'acoes'|'cripto'} AtivoKey
 */

/**
 * @typedef {'normal'|'hardcore'} Dificuldade
 */

/**
 * @typedef {'faliu'|'livre'|'apos_sucesso'|'apos_faliu'|'imoveis_fim'} FimDeJogo
 */

/**
 * @typedef {Object} LogItem
 * @property {number} id
 * @property {string} mes
 * @property {string} texto
 * @property {string} cor
 */

/**
 * @typedef {Object} EstadoAposentadoria
 * @property {'acumulacao'|'saque'} fase
 * @property {'fixo'|'percentual'} saqueModo
 * @property {number} taxaSaque
 * @property {number} turnosAcumulacao
 * @property {number} turnosSaque
 * @property {number} saquesFeitos
 * @property {number} saqueMes
 * @property {boolean} esgotou
 */

/**
 * @typedef {Object} EstadoImoveis
 * @property {'comprar'|'alugar'} escolha
 * @property {number} prazo
 * @property {number} pagas
 * @property {number} parcela
 * @property {number} aluguel
 * @property {number} valorImovel
 * @property {number} carteiraAluguel
 * @property {number} varImovelMes
 */

/**
 * @typedef {Object} EstadoNegocio
 * @property {number} caixa
 * @property {number} receitaBase
 * @property {number} custoFixo
 * @property {number} nivel
 * @property {number} mesesNoVermelho
 * @property {boolean} falido
 * @property {number|null} receitaMes
 * @property {number} varReceitaMes
 */

/**
 * @typedef {Object} PosicaoRealista
 * @property {number} custo         custo médio de aquisição do que ainda está na mão
 * @property {number} mesMedio      idade média ponderada dos aportes (base do IR regressivo)
 * @property {number|null} mesEntrada
 * @property {number} curva         valor sem marcação a mercado (o que vale no vencimento)
 */

/**
 * @typedef {Object} MacroRealista
 * @property {number} selic
 * @property {number} selicAlvo
 * @property {number} ipca
 * @property {number} ipcaAlvo
 * @property {number} dPre          variação da Selic no mês (marcação do prefixado)
 * @property {number} dReal         variação do juro real (marcação do IPCA+)
 */

/**
 * @typedef {Object} CustosRealista
 * @property {number} adm
 * @property {number} corretagem
 * @property {number} comeCotas
 * @property {number} ir
 */

/**
 * @typedef {Object} EstadoRealista
 * @property {'alta'|'baixa'} macroInicial
 * @property {MacroRealista} macro
 * @property {Record<string, PosicaoRealista>} posicoes
 * @property {{acoes: number, fii: number, cripto: number}} vendasMes
 * @property {CustosRealista} mesCustos
 * @property {CustosRealista} custosTotais
 * @property {number} mesRenda
 * @property {number} choqueInflacao
 * @property {number} mesesVacancia
 * @property {number} mesesSemIsencao
 */

/**
 * @typedef {Object} GameState
 * @property {'intro'|'jogo'} tela
 * @property {Dificuldade} dificuldade
 * @property {string} modo
 * @property {string|null} cenario
 * @property {number|null} capitalInicial
 * @property {EstadoAposentadoria|null} aposentadoria
 * @property {EstadoImoveis|null} imoveis
 * @property {EstadoNegocio|null} negocio
 * @property {EstadoRealista|null} realista
 * @property {number} mes
 * @property {number} caixa
 * @property {number} salario
 * @property {number} custo
 * @property {number} semSalario
 * @property {Record<string, number>} ativos
 * @property {Record<string, number>} varMes
 * @property {number[]} hist
 * @property {LogItem[]} log
 * @property {FimDeJogo|null} fim
 * @property {boolean} hard
 * @property {boolean} auto
 * @property {number|null} inicioTs
 * @property {number|null} fimTs
 * @property {number} agora
 * @property {number} proximoLogId
 * @property {boolean} [marcoLivre]
 * @property {boolean} [liquidacaoNoMes]
 * @property {number} [pendente]
 */

/**
 * @typedef {Object} NovoJogoProps
 * @property {Dificuldade} [dificuldade]
 * @property {number} [salarioInicial]
 * @property {string} [modo]
 * @property {number|null} [capitalInicial]
 * @property {string|null} [cenario]
 * @property {'fixo'|'percentual'} [saqueModo]
 * @property {'comprar'|'alugar'} [imoveisEscolha]
 * @property {'alta'|'baixa'} [macroInicial]
 */

/**
 * @typedef {Object} RegistroPlacar
 * @property {string} nome
 * @property {string} modo
 * @property {string} detalhe
 * @property {string} dificuldade
 * @property {string} resultado
 * @property {number} meses
 * @property {number} pat
 * @property {number} tempo
 * @property {number} score
 * @property {boolean} [voce]
 * @property {number} [ts]
 */

/**
 * @typedef {Object} StorageLike
 * @property {(key: string) => string|null} getItem
 * @property {(key: string, value: string) => void} [setItem]
 */

/**
 * @typedef {Object} SparklineResult
 * @property {string} points
 * @property {boolean} positivo
 */

module.exports = {};
