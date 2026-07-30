// Os custos que ninguém vê — e é justamente por não vê-los que eles doem.
//
// Taxa de administração sai do saldo, corretagem sai por ordem, come-cotas
// morde a cada semestre e o IR fica retido na venda. Cada um é pequeno; o
// acumulado da partida não é. Este card existe para transformar essa soma
// invisível num número na tela.
import { useSelector } from 'react-redux';
import { selectCustosMes } from '../features/game/selectors';

export function CustosCard() {
  const c = useSelector(selectCustosMes);
  if (!c) return null;

  return (
    <div
      style={{
        background: 'var(--superficie-2)', border: '1px solid var(--borda)', borderRadius: 6,
        padding: '12px 16px', display: 'grid', gap: 4, color: 'var(--texto)', fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <span style={{ color: 'var(--texto-rotulo)', fontSize: 10, letterSpacing: 1 }}>CUSTOS DA PARTIDA</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--alerta)' }}>−{c.totalFmt}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--texto-rotulo)' }}>{c.linhas}</div>
      <div style={{ fontSize: 10, color: 'var(--texto-apagado)' }}>neste mês: −{c.mesFmt}</div>
    </div>
  );
}
