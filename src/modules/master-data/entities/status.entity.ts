import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';

@Entity('status')
export class Status extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  status!: string;
}