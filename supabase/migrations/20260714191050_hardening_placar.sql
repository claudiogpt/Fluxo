-- Blindagem do placar global — rode no SQL Editor do Supabase (idempotente).
-- Camadas: RLS (só select+insert) + CHECKs (limites) + trigger (consistência).
-- A fórmula do trigger espelha scoreDe() em engine/placar.js — mudou lá, mude aqui.

-- 0) Limpa as linhas de teste criadas durante a integração.
delete from placar where nome like 'TESTE.%';

-- 1) Cinto e suspensório: além do RLS, revoga os privilégios de escrita
--    destrutiva no nível de GRANT (mesmo que alguém crie uma policy errada
--    no futuro, o papel anon continua sem o privilégio).
revoke update, delete, truncate, references, trigger on table placar from anon, authenticated;

-- 2) Nome sem caracteres de controle (o CHECK de tamanho já existe).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'placar_nome_sem_controle') then
    alter table placar add constraint placar_nome_sem_controle
      check (nome !~ '[[:cntrl:]]');
  end if;
end $$;

-- 3) Validação de consistência no servidor: resultado permitido por modo,
--    detalhe permitido por modo, e score recalculado — linha forjada com
--    score inventado é rejeitada antes de entrar.
create or replace function placar_valida_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  vitoria boolean;
  score_esperado bigint;
begin
  -- pares (modo, resultado) que o jogo realmente produz
  if not (
    (new.modo = 'classico'      and new.resultado in ('livre', 'faliu')) or
    (new.modo = 'empresario'    and new.resultado in ('livre', 'faliu')) or
    (new.modo = 'sandbox'       and new.resultado = 'marco') or
    (new.modo = 'aposentadoria' and new.resultado in ('apos_sucesso', 'apos_faliu', 'faliu')) or
    (new.modo = 'imoveis'       and new.resultado in ('imoveis_fim', 'faliu'))
  ) then
    raise exception 'resultado % invalido para o modo %', new.resultado, new.modo;
  end if;

  -- detalhe permitido por modo
  if not (
    (new.modo = 'sandbox'       and new.detalhe in ('1000', '10000', '100000')) or
    (new.modo = 'aposentadoria' and new.detalhe in ('fixo', 'percentual')) or
    (new.modo = 'imoveis'       and new.detalhe in ('comprar', 'alugar')) or
    (new.modo in ('classico', 'empresario') and new.detalhe = '')
  ) then
    raise exception 'detalhe "%" invalido para o modo %', new.detalhe, new.modo;
  end if;

  -- espelho exato de scoreDe() em engine/placar.js
  vitoria := new.resultado in ('livre', 'marco', 'apos_sucesso', 'imoveis_fim');
  if not vitoria then
    score_esperado := new.meses;
  elsif new.modo in ('aposentadoria', 'imoveis') then
    score_esperado := 1000000000000 + greatest(new.pat, 0);
  else
    score_esperado := 1000000000000 - new.meses::bigint * 1000000 - least(greatest(new.tempo, 0), 999999);
  end if;

  if new.score is distinct from score_esperado then
    raise exception 'score inconsistente com a formula (esperado %, veio %)', score_esperado, new.score;
  end if;

  return new;
end;
$$;

drop trigger if exists placar_valida on placar;
create trigger placar_valida
  before insert on placar
  for each row execute function placar_valida_insert();
