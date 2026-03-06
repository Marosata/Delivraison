-- PHASE 9: Attribution automatique

-- Enum attribution_mode
do $$
begin
  if not exists (select 1 from pg_type where typname = 'attribution_mode') then
    create type public.attribution_mode as enum ('automatique', 'manuelle');
  end if;
end $$;

-- Colonnes profiles pour attribution
alter table public.profiles
add column if not exists position_lat float,
add column if not exists position_lng float,
add column if not exists position_updated_at timestamptz,
add column if not exists charge_actuelle int not null default 0;

-- Index pour performance attribution
create index if not exists profiles_position_idx on public.profiles (position_lat, position_lng);
create index if not exists profiles_charge_actuelle_idx on public.profiles (charge_actuelle);

-- Colonnes commandes pour attribution
alter table public.commandes
add column if not exists score_attribution float,
add column if not exists attribution_mode public.attribution_mode not null default 'manuelle';

-- RLS: livreur peut voir ses propres attributions, admin tout
drop policy if exists "profiles_select_admin_or_self" on public.profiles;
create policy "profiles_select_admin_or_self"
on public.profiles
for select
to authenticated
using (
  public.is_admin_jwt() OR id = auth.uid()
);

-- Trigger pour mettre à jour charge_actuelle
create or replace function public.update_charge_actuelle()
returns trigger
language plpgsql
as $$
begin
  -- Si assignation d'une commande
  if (tg_op = 'UPDATE' and old.livreur_id is null and new.livreur_id is not null) then
    update public.profiles
    set charge_actuelle = charge_actuelle + 1
    where id = new.livreur_id;
  end if;

  -- Si désassignation ou changement de livreur
  if (tg_op = 'UPDATE' and old.livreur_id is not null and new.livreur_id != old.livreur_id) then
    update public.profiles
    set charge_actuelle = charge_actuelle - 1
    where id = old.livreur_id;

    if (new.livreur_id is not null) then
      update public.profiles
      set charge_actuelle = charge_actuelle + 1
      where id = new.livreur_id;
    end if;
  end if;

  -- Si commande terminée
  if (tg_op = 'UPDATE' and old.statut != 'livré' and new.statut = 'livré' and new.livreur_id is not null) then
    update public.profiles
    set charge_actuelle = charge_actuelle - 1
    where id = new.livreur_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_update_charge_actuelle on public.commandes;
create trigger trg_update_charge_actuelle
after update on public.commandes
for each row
execute function public.update_charge_actuelle();
