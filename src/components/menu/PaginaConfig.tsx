// Configurações. Nem todo item navega: tema e fontes são controles na própria
// página, glossário abre um overlay e perfil vai pra outra tela — por isso a
// lista carrega um discriminante de ação em vez de só uma rota.
import { useDispatch, useSelector } from 'react-redux';
import {
  selectPrefs,
  setContraste,
  setEscala,
  setFonte,
  setTema,
  setVisao,
  type ContrasteId,
  type EscalaId,
  type FonteFamiliaId,
  type TemaId,
  type VisaoId,
} from '../../features/prefs';
import { irPara } from '../../features/ui/uiSlice';
import type { AppDispatch } from '../../store';
import { BotaoMenu } from './BotaoMenu';
import { GrupoOpcoes } from './GrupoOpcoes';
import { MenuLayout } from './MenuLayout';

export function PaginaConfig() {
  const prefs = useSelector(selectPrefs);
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

      <GrupoOpcoes
        titulo="CONTRASTE"
        grupo={{
          valor: prefs.contraste,
          opcoes: [
            { id: 'normal', rotulo: 'NORMAL' },
            { id: 'alto', rotulo: '◐ ALTO CONTRASTE' },
          ],
          dica: 'escurece o texto de apoio e reforça bordas e fundos',
        }}
        aoEscolher={(id) => dispatch(setContraste(id as ContrasteId))}
      />

      <GrupoOpcoes
        titulo="VISÃO DE CORES"
        grupo={{
          valor: prefs.visao,
          opcoes: [
            { id: 'padrao', rotulo: 'PADRÃO' },
            { id: 'daltonico', rotulo: '👁 DALTÔNICO' },
          ],
          dica: 'troca ganho e perda por azul e laranja, que não se confundem',
        }}
        aoEscolher={(id) => dispatch(setVisao(id as VisaoId))}
      />

      <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
        <BotaoMenu
          item={{
            id: 'perfil',
            icone: '👤',
            rotulo: 'PERFIL',
            descricao: 'seu nome no placar',
            disponivel: true,
          }}
          aoClicar={() => dispatch(irPara('perfil'))}
        />
      </div>
    </MenuLayout>
  );
}
