import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../common/database/base.entity";
import { User } from "../../users/entities/user.entity";
import { Status } from "../../master-data/entities/status.entity";
import { Event } from "../../events/entities/event.entity";
import { ManyToOne, JoinColumn } from "typeorm";
import { EncryptionTransformer } from "src/common/transformers/encryption.transformer";

@Entity('recordings')
export class Recording extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255 })
  link!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user!: User;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'id_status' })
  status!: Status;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'id_event' })
  event?: Event;
}