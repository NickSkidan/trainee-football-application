import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users', schema: 'football' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  username!: string;

  @Column({ length: 255 })
  email!: string;

  @Column({ length: 255 })
  password!: string;
}