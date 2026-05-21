import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/database/base.entity";
import { Status } from "../../master-data/entities/status.entity";
import { Event } from "../../events/entities/event.entity";
import { EncryptionTransformer } from "src/common/transformers/encryption.transformer";

@Entity('calendar_jobs')
export class CalendarJob extends BaseEntity {
  @Column({ name: 'total_emails', type: 'integer' })
  totalEmails!: number;

  @Column({ name: 'processed_emails', type: 'integer', default: 0 })
  processedEmails?: number;

  @Column({ name: 'failed_emails', type: 'integer', default: 0 })
  failedEmails?: number;

  @Column({ name: 'error_log', type: 'jsonb', nullable: true })
  errorLog?: any;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'id_event' })
  event?: Event;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'id_status' })
  status?: Status;
}