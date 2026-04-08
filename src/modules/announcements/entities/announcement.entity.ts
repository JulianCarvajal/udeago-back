import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/database/base.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Status } from "src/modules/master-data/entities/status.entity";

@Entity('announcements')
export class Announcement extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user!: User;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'id_status' })
  status!: Status;
}