import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;
}