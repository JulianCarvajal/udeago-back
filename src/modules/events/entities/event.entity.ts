import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Category } from './category.entity';
import { Status } from '../../master-data/entities/status.entity';
import { User } from '../../users/entities/user.entity';

@Entity('events')
export class Event extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'pub_date', type: 'timestamptz' })
  pubDate!: Date;

  @Column({ name: 'date_start', type: 'timestamptz' })
  dateStart!: Date;

  @Column({ name: 'date_end', type: 'timestamptz', nullable: true })
  dateEnd?: Date;

  @Column({ type: 'boolean', default: false })
  virtual!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link?: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // Link Youtube
  video?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'integer', nullable: true })
  capacity?: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'id_category' })
  category!: Category;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'id_status' })
  status!: Status;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  manager!: User;
}