create type penalty_winner as enum ('HOME', 'AWAY');

alter table predictions
  add column penalty_pred   penalty_winner,
  add column penalty_points int not null default 0;

comment on column predictions.penalty_pred is
  'Quién elige el usuario que avanza por penales, cuando predice un marcador empatado en mata-mata. NULL si no aplica.';
comment on column predictions.penalty_points is
  'Bono fijo (0 o 2) por acertar quién pasa en la tanda de penales. Independiente de points_earned.';
