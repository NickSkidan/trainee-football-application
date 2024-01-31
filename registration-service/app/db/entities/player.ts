import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { IsUUID } from "class-validator";
import { PlayerPosition } from "../../utilities/player-position";
import { User } from "./user";
import { Team } from "./team";

@Entity("players")
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  id?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  name?: string;

  @Column({ type: "int" })
  age?: number;

  @Column({ type: "enum", enum: PlayerPosition, default: null, nullable: true })
  position?: PlayerPosition;

  @OneToOne(() => User, (user) => user.player)
  @JoinColumn({ name: "user_id" })
  user?: User;

  @ManyToOne(() => Team, (team) => team.players, { nullable: true })
  @JoinColumn({ name: "team_id" })
  team?: Team;

  @Column({ type: "text", nullable: true })
  player_photo_url?: string;

  @Column({ type: "bigint" })
  price?: number;
}
