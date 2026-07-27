// Configurações. Nem todo item navega: tema e fontes são controles na própria
// página, glossário abre um overlay e perfil vai pra outra tela — por isso a
// lista carrega um discriminante de ação em vez de só uma rota.
import { useDispatch, useSelector } from 'react-redux';
import {
  selectPrefs,
  setEscala,
  setFonte,
  setTema,
  type EscalaId,
  type FonteFamiliaId,
  type TemaId,
} from '../../features/prefs';
import { selectContador } from '../../features/conceitos/conceitosSlice';
import { abrirGlossario, irPara } from '../../features/ui/uiSlice';
import type { AppDispatch } from '../../store';
import { BotaoMenu } from './BotaoMenu';
import { GrupoOpcoes } from './GrupoOpcoes';
import { MenuLayout } from './MenuLayout';

export function PaginaConfig() {
  const prefs = useSelector(selectPrefs);
  const contador = useSelector(selectContador);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <MenuLayout titulo="CONFIGURAÇÕES" descricao="Aparência e conta. Fica salvo neste dispositivo.">
      <GrupoOpcoes
        titulo="TEMA"
        grupo={{
          valor: prefs.tema,
          opcoes: [
            { id: 'escuro', rotulo: '🌙 ESCURO' },
            { id: 'claro', rotulo: '☀ CLARO' },
          ],
          dica: 'o escuro é o visual original do terminal',
        }}
        aoEscolher={(id) => dispatch(setTema(id as TemaId))}
      />

      <GrupoOpcoes
        titulo="FONTE"
        grupo={{
          valor: prefs.fonte,
          opcoes: [
            { id: 'mono', rotulo: 'MONOESPAÇADA' },
            { id: 'sans', rotulo: 'SEM SERIFA' },
          ],
          dica: 'a monoespaçada alinha os números em coluna',
        }}
        aoEscolher={(id) => dispatch(setFonte(id as FonteFamiliaId))}
      />

      <GrupoOpcoes
        titulo="TAMANHO DO TEXTO"
        grupo={{
          valor: prefs.escala,
          opcoes: [
            { id: 'compacto', rotulo: 'COMPACTO' },
            { id: 'normal', rotulo: 'NORMAL' },
            { id: 'grande', rotulo: 'GRANDE' },
          ],
          dica: 'escala a interface inteira, não só a letra',
        }}
        aoEscolher={(id) => dispatch(setEscala(id as EscalaId))}
      />

      <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
        <BotaoMenu
          item={{
            id: 'config',
            icone: '📖',
            rotulo: 'GLOSSÁRIO',
            descricao: `${contador} — os termos que o jogo já te ensinou`,
            disponivel: true,
          }}
          aoClicar={() => dispatch(abrirGlossario())}
        />
        <BotaoMenu
          item={{
            id: 'perfil',
            icone: '👤',
            rotulo: 'PERFIL',
            descricao: 'seu nome no placar global',
            disponivel: true,
          }}
          aoClicar={() => dispatch(irPara('perfil'))}
        />
      </div>
    </MenuLayout>
  );
}
