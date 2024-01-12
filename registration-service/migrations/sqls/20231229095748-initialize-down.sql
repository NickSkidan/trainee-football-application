ALTER TABLE IF EXISTS players DROP CONSTRAINT IF EXISTS fk_p_team_id;

ALTER TABLE IF EXISTS players DROP CONSTRAINT IF EXISTS fk_p_user_id;

ALTER TABLE IF EXISTS teams DROP CONSTRAINT IF EXISTS fk_t_user_id;

DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS player_position;
DROP TYPE IF EXISTS team_formation;
DROP TYPE IF EXISTS user_role;

DROP EXTENSION IF EXISTS "uuid-ossp";