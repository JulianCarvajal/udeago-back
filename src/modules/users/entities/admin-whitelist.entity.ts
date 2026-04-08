import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { User } from './user.entity';
import { EncryptionTransformer } from 'src/common/transformers/encryption.transformer';

@Entity('admin_whitelist')
export class AdminWhiteList extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'id_user_creator' })
  userCreator?: User;
}