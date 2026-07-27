// Perfil: por enquanto só o nick que assina o placar global.
import { useDispatch, useSelector } from 'react-redux';
import { placar } from '../../engine';
import { selectNick, setNick } from '../../features/placar/placarSlice';
import type { AppDispatch } from '../../store';
import { MenuLayout } from './MenuLayout';
import { dica, secaoTitulo } from './estilos';

export function PaginaPerfil() {
  const nick = useSelector(selectNick);
  const dispatch = useDispatch<AppDispatch>();
  const online = placar.online();

  return (
    <MenuLayout titulo="PERFIL" descricao="Como você aparece no ranking.">
      <div style={secaoTitulo}>NOME NO PLACAR</div>
      <input
        value={nick}
        onChange={(e) => dispatch(setNick(e.target.value))}
        maxLength={16}
        placeholder="SEU.NICK"
        spellCheck={false}
        aria-label="Nome no placar"
        style={{
          background: 'var(--superficie-2)',
          border: '1px solid var(--borda)',
          color: 'var(--texto-forte)',
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: 1,
          padding: '9px 14px',
          borderRadius: 4,
          width: 200,
          outline: 'none',
          textTransform: 'uppercase',
        }}
      />
      <div style={{ ...dica, marginTop: 10 }}>
        {online
          ? 'seu nome no ranking mundial — todos os modos têm placar global'
          : 'placar global desligado — recordes ficam salvos só neste dispositivo'}
      </div>
    </MenuLayout>
  );
}
