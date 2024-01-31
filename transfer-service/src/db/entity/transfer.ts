import { IsUUID } from "class-validator";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("transfers")
export class Transfer extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  id: string;

  @Column({ type: "uuid" })
  user_id: string;

  @Column({ type: "uuid" })
  player_id: string;

  @Column({ type: "uuid", nullable: true })
  previous_team_id: string;

  @Column({ type: "uuid" })
  current_team_id: string;

  @Column({ type: "bigint", nullable: true })
  player_price: number;

  @CreateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at?: Date;
}
