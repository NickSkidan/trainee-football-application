import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  BaseEntity,
  Index,
  OneToOne,
} from "typeorm";
import { IsEmail, IsNotEmpty, IsUUID } from "class-validator";
import { UserRole } from "../../utilities/user-role";
import { Player } from "./player";
import { Team } from "./team";

@Entity("users")
@Unique(["email"])
@Unique(["phone"])
@Index("idx_email", ["email"])
@Index("idx_phone", ["phone"])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  id?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  first_name?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  last_name?: string;

  @Column({ type: "varchar", length: 255 })
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @Column({ type: "varchar", length: 255 })
  @IsNotEmpty()
  password?: string;

  @Column({ type: "varchar", length: 50 })
  @IsNotEmpty()
  phone?: string;

  @Column({ type: "enum", enum: UserRole, default: null, nullable: true })
  role?: UserRole;

  @CreateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at?: Date;

  @Column({ type: "int", nullable: true })
  verification_code?: number;

  @Column({ type: "timestamptz", nullable: true })
  expiry?: Date;

  @Column({ type: "boolean", default: false })
  verified?: boolean;

  @OneToOne(() => Player, (player) => player.user)
  player?: Player;

  @OneToOne(() => Team, (team) => team.user)
  team?: Team;
}
