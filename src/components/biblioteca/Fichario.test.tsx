// O fichário pelo lado de quem usa: trocar de prateleira, achar um verbete,
// abrir, andar pros vizinhos e sair.
//
// O que estes testes defendem: a estante e o painel são UM só componente
// servindo três prateleiras. Se algum dia glossário, manual e fundamentos
// precisarem de telas diferentes, é aqui que vai doer primeiro.
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { marcarVisto } from '../../features/conceitos/conceitosSlice';
import { irPara, selectRota } from '../../features/ui/uiSlice';
import { makeStore } from '../../store';
import { Fichario } from './Fichario';

type Store = ReturnType<typeof makeStore>;

function montar(): Store {
  const store = makeStore();
  // a rota entra na pilha pra que o VOLTAR tenha de onde voltar
  store.dispatch(irPara('biblioteca'));
  render(
    <Provider store={store}>
      <Fichario />
    </Provider>
  );
  return store;
}

const aba = (nome: RegExp) => screen.getByRole('tab', { name: nome });
// pelo nome, e não por `getByRole('list')`: a prosa do verbete também tem
// listas, e a estante não pode ser "a primeira que aparecer"
const estante = () => screen.getByRole('list', { name: /^Índice/ });
const titulo = () => screen.getByRole('heading', { level: 2 }).textContent;

describe('fichário da biblioteca', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('abre no glossário, com o primeiro verbete já na tela', () => {
    montar();
    expect(aba(/GLOSSÁRIO/).getAttribute('aria-selected')).toBe('true');
    // não existe estado "nada selecionado": o painel nunca abre vazio
    expect(titulo()).toBe('Peculium');
    expect(screen.getByText(/direito romano/)).toBeDefined();
  });

  it('trocar de aba troca o índice e o verbete junto', () => {
    montar();
    fireEvent.click(aba(/MANUAL/));
    expect(titulo()).toBe('COMO O MÊS FECHA');
    expect(within(estante()).getByText('ATALHOS DE TECLADO')).toBeDefined();
    // e o glossário sai de cena
    expect(within(estante()).queryByText('Peculium')).toBeNull();
  });

  it('clicar num item da estante abre aquele verbete', () => {
    montar();
    fireEvent.click(aba(/MANUAL/));
    fireEvent.click(within(estante()).getByText('CENÁRIOS'));
    expect(titulo()).toBe('CENÁRIOS');
  });

  it('a busca filtra a estante, e o painel acompanha', () => {
    montar();
    fireEvent.click(aba(/MANUAL/));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'atalho' } });

    const itens = within(estante()).getAllByRole('listitem');
    expect(itens).toHaveLength(1);
    // o verbete aberto acompanha o filtro em vez de mostrar algo fora da lista
    expect(titulo()).toBe('ATALHOS DE TECLADO');
  });

  it('busca sem resultado diz que não achou, em vez de mostrar tela vazia', () => {
    montar();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzz' } });
    expect(screen.getByText(/nada com esse nome/)).toBeDefined();
  });

  it('o rodapé anda pro vizinho e não inventa vizinho nas pontas', () => {
    montar();
    fireEvent.click(aba(/MANUAL/));
    expect(screen.queryByRole('button', { name: /^←/ })).toBeNull(); // é o primeiro
    fireEvent.click(screen.getByRole('button', { name: /MODOS DE JOGO →/ }));
    expect(titulo()).toBe('MODOS DE JOGO');
    expect(screen.getByRole('button', { name: /← COMO O MÊS FECHA/ })).toBeDefined();
  });

  it('os números do capítulo vêm antes da prosa, e só onde existem', () => {
    montar();
    fireEvent.click(aba(/MANUAL/));
    expect(screen.getByText('ENTRA')).toBeDefined();
    expect(screen.getByText('+0,4%/mês')).toBeDefined();
    expect(screen.getByText('FALIU')).toBeDefined();

    fireEvent.click(within(estante()).getByText('ATALHOS DE TECLADO'));
    expect(screen.queryByText('ENTRA')).toBeNull();
  });

  it('fundamentos trancado não vira parede de "???" — conta o que falta', () => {
    montar();
    fireEvent.click(aba(/FUNDAMENTOS/));
    expect(within(estante()).queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByText(/isto se destrava jogando/)).toBeDefined();
    expect(screen.getByText(/^\+ 2 trancados/)).toBeDefined();
  });

  it('destravado o estudo, ele entra na estante marcado como NOVO', () => {
    const store = montar();
    store.dispatch(marcarVisto('liquidacaoForcada'));
    fireEvent.click(aba(/FUNDAMENTOS/));

    const item = within(estante()).getAllByRole('listitem')[0];
    expect(item.textContent).toContain('NOVO');
    fireEvent.click(within(item).getByRole('button'));
    // abrir É ler: não existe botão "marcar como lido"
    expect(store.getState().biblioteca.estudosLidos).toContain('liquidez-e-venda-forcada');
    expect(screen.getByText('ONDE ISSO APARECE NO JOGO')).toBeDefined();
  });

  it('VOLTAR sai da biblioteca em vez de trocar de prateleira', () => {
    const store = montar();
    fireEvent.click(aba(/MANUAL/));
    fireEvent.click(screen.getByRole('button', { name: /VOLTAR/ }));
    expect(selectRota(store.getState())).toBe('home');
    // a prateleira continua onde estava — sair não é resetar
    expect(store.getState().biblioteca.prateleiraAtiva).toBe('manual');
  });
});
