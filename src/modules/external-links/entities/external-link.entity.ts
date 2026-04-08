import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/database/base.entity";
import { User } from "src/modules/users/entities/user.entity";

@Entity('external_links')
export class ExternalLink extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user!: User;
}