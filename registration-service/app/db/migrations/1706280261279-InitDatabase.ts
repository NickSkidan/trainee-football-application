import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1706280261279 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ 
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'user_role'
              ) THEN
                CREATE TYPE user_role AS ENUM ('PLAYER', 'COACH');
              END IF;
            END $$;

            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE IF NOT EXISTS users (
              id UUID DEFAULT uuid_generate_v4() NOT NULL,
              first_name VARCHAR(255) DEFAULT NULL,
              last_name VARCHAR(255) DEFAULT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              phone VARCHAR(50) UNIQUE NOT NULL,
              role user_role DEFAULT NULL,
              created_at timestamptz NOT NULL DEFAULT (now()),
              verification_code INT,
              expiry timestamptz DEFAULT NULL,
              verified BOOLEAN DEFAULT FALSE,
              PRIMARY KEY (id)
            );

            CREATE INDEX ON users (email);
            CREATE INDEX ON users (phone);

            DO $$ 
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'team_formation'
              ) THEN
                CREATE TYPE team_formation AS ENUM ('4-3-3', '3-4-3', '4-5-1', '5-3-2', '4-4-2');
              END IF;
            END $$;

            CREATE TABLE IF NOT EXISTS teams (
              id UUID DEFAULT uuid_generate_v4() NOT NULL,
              name VARCHAR(255) DEFAULT NULL,
              formation team_formation DEFAULT NULL,
              user_id UUID,
              team_logo_url TEXT,
              budget BIGINT,
              PRIMARY KEY (id),
              CONSTRAINT fk_t_user_id FOREIGN KEY (user_id) REFERENCES users (id)
            );

            DO $$ 
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'player_position'
              ) THEN
                CREATE TYPE player_position AS ENUM ('GK', 'CB', 'LB', 'RB', 'FB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST', 'CF');
              END IF;
            END $$;

            CREATE TABLE IF NOT EXISTS players (
              id UUID DEFAULT uuid_generate_v4() NOT NULL,
              name VARCHAR(255) DEFAULT NULL,
              age INT,
              position player_position DEFAULT NULL,
              user_id UUID,
              team_id UUID DEFAULT NULL,
              player_photo_url TEXT,
              price BIGINT,
              PRIMARY KEY (id),
              CONSTRAINT fk_p_user_id FOREIGN KEY (user_id) REFERENCES users (id),
              CONSTRAINT fk_p_team_id FOREIGN KEY (team_id) REFERENCES teams (id)
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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
    `);
  }
}
