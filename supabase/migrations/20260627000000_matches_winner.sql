create type match_winner as enum ('HOME', 'AWAY', 'DRAW');

alter table matches
  add column winner   match_winner,
  add column duration text;  -- 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT', de football-data.org

comment on column matches.winner is
  'Equipo que avanzó realmente (derivado de score.winner de football-data.org). NULL si no aplica o aún no definido.';
comment on column matches.duration is
  'Cómo se definió el partido según football-data.org. Determina si corresponde evaluar penalty_pred.';
