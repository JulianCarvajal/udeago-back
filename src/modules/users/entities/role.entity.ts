import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { User } from './user.entity';
import { EncryptionTransformer } from 'src/common/transformers/encryption.transformer';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  rol!: string;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}