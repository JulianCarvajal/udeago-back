import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Role } from './role.entity';
import { EncryptionTransformer } from 'src/common/transformers/encryption.transformer';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 500, transformer: new EncryptionTransformer() })
  name!: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  email!: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true, transformer: new EncryptionTransformer() })
  avatarUrl?: string;

  @Column({ name: 'provider_id', type: 'text', unique: true })
  providerId!: string;

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin?: Date;

  // Guardamos el refresh token para poder crear eventos de Google Calendar
  // en nombre del admin logueado. Se cifra porque es una credencial sensible.
  @Column({
    name: 'google_refresh_token',
    type: 'text',
    nullable: true,
    transformer: new EncryptionTransformer(),
  })
  googleRefreshToken?: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'id_role' })
  role!: Role;
}