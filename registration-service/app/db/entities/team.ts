import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { IsUUID } from "class-validator";
import { Player } from "./player";
import { TeamFormation } from "../../utilities/team-formation";
import { User } from "./user";

@Entity("teams")
export class Team extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  id?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  name?: string;

  @Column({ type: "enum", enum: TeamFormation, default: null, nullable: true })
  formation?: TeamFormation;

  @OneToOne(() => User, (user) => user.team)
  @JoinColumn({ name: "user_id" })
  user?: User;

  @Column({ type: "text", nullable: true })
  team_logo_url?: string;

  @Column({ type: "bigint" })
  budget?: number;

  @OneToMany(() => Player, (player) => player.team)
  players?: Player[];
}
