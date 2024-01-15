CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS transfers (
  id UUID DEFAULT uuid_generate_v4() NOT NULL,
  user_id UUID NOT NULL,
  player_id UUID NOT NULL,
  previous_team_id UUID DEFAULT NULL,
  current_team_id UUID NOT NULL,
  player_price BIGINT,
  created_at timestamptz NOT NULL DEFAULT (now()),
  PRIMARY KEY (id)
);