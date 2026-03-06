-- Extensions
create extension if not exists "uuid-ossp";

-- Table commande_historique
create table if not exists public.commande_historique (
  id uuid primary key default uuid_generate_v4(),
  commande_id uuid not null references public.commandes (id) on delete cascade,
  ancien_statut public.commande_statut,
  nouveau_statut public.commande_statut not null,
  changed_at timestamptz not null default now(),
  changed_by uuid not null references public.profiles (id) on delete cascade
);

-- Index pour performance
create index if not exists commande_historique_commande_id_idx on public.commande_historique (commande_id);
create index if not exists commande_historique_changed_at_idx on public.commande_historique (changed_at desc);

-- Trigger automatique sur update du statut
create or replace function public.log_commande_statut_change()
returns trigger
language plpgsql
as $$
begin
  if old.statut is distinct from new.statut then
    -- Récupérer l'utilisateur actuel via JWT
    insert into public.commande_historique (commande_id, ancien_statut, nouveau_statut, changed_by)
    values (new.id, old.statut, new.statut, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_commande_statut on public.commandes;
create trigger trg_log_commande_statut
after update of statut on public.commandes
for each row
execute function public.log_commande_statut_change();

-- RLS sur commande_historique
alter table public.commande_historique enable row level security;

drop policy if exists "commande_historique_admin_all" on public.commande_historique;
drop policy if exists "commande_historique_livreur_own" on public.commande_historique;

create policy "commande_historique_admin_all"
on public.commande_historique
for all
to authenticated
using (public.is_admin_jwt());

create policy "commande_historique_livreur_own"
on public.commande_historique
for select
to authenticated
using (
  public.is_livreur_jwt()
  and commande_id in (
    select id from public.commandes where livreur_id = auth.uid()
  )
);
