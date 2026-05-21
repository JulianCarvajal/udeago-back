import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CalendarJob } from './entities/calendar-job';
import { Event } from '../events/entities/event.entity';
import { Status } from '../master-data/entities/status.entity';
import { User } from '../users/entities/user.entity';
import { CreateCalendarJobDto } from './dto/create-calendar-job.dto';
import { CALENDAR_QUEUE, InviteBatchPayload } from './calendar-jobs.processor';

const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 1500;

@Injectable()
export class CalendarJobsService {
  private readonly logger = new Logger(CalendarJobsService.name);

  constructor(
    @InjectRepository(CalendarJob)
    private readonly calendarJobRepo: Repository<CalendarJob>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectQueue(CALENDAR_QUEUE)
    private readonly calendarQueue: Queue,
  ) {}

  async create(dto: CreateCalendarJobDto, adminUserId: string) {
    // 1. Verificar que el admin tiene refreshToken guardado
    const admin = await this.userRepo.findOne({ where: { id: adminUserId } });
    if (!admin?.googleRefreshToken) {
      throw new UnauthorizedException(
        'Tu sesión no tiene permisos de Google Calendar. ' +
        'Cierra sesión, vuelve a ingresar con Google y acepta el permiso de calendario.',
      );
    }

    // 2. Verificar que el evento existe
    const event = await this.eventRepo.findOne({ where: { id: dto.id_event } });
    if (!event) throw new NotFoundException('Evento no encontrado');

    // 3. Deduplicar y normalizar correos
    const uniqueEmails = [...new Set(dto.emails.map((e) => e.toLowerCase()))];
    if (uniqueEmails.length === 0) {
      throw new BadRequestException('No hay correos válidos después de deduplicar');
    }

    // 4. Persistir el CalendarJob con estado ACTIVO
    const activeStatus = await this.statusRepo.findOne({ where: { status: 'ACTIVO' } });
    const calendarJob = this.calendarJobRepo.create({
      event,
      totalEmails: uniqueEmails.length,
      processedEmails: 0,
      failedEmails: 0,
      status: activeStatus ?? undefined,
    });
    const saved = await this.calendarJobRepo.save(calendarJob);

    // 5. Dividir en lotes y encolar con delay escalonado
    // IMPORTANTE: NO pasamos el refreshToken en el payload del job.
    // El processor lo lee directamente de BD via TypeORM para garantizar
    // que el EncryptionTransformer lo descifre correctamente.
    const batches = this.chunk(uniqueEmails, BATCH_SIZE);

    for (let i = 0; i < batches.length; i++) {
      const payload: InviteBatchPayload = {
        calendarJobId: saved.id,
        adminUserId,              // <-- solo el ID; el processor busca el token en BD
        eventTitle: event.title,
        eventDescription: event.description,
        eventStart: event.dateStart.toISOString(),
        eventEnd: (event.dateEnd ?? event.dateStart).toISOString(),
        eventLocation: event.location,
        batchIndex: i,
        totalBatches: batches.length,
        emails: batches[i],
      };

      await this.calendarQueue.add('invite-batch', payload, {
        delay: i * BATCH_DELAY_MS,
        attempts: 3,
        backoff: { type: 'exponential', delay: 8000 },
        removeOnComplete: { age: 86_400 },
        removeOnFail: false,
      });
    }

    this.logger.log(
      `CalendarJob ${saved.id}: ${uniqueEmails.length} correos · ${batches.length} lotes encolados`,
    );

    return {
      calendarJobId: saved.id,
      totalEmails: uniqueEmails.length,
      totalBatches: batches.length,
      message: `Proceso iniciado. Se procesarán ${uniqueEmails.length} invitaciones en segundo plano.`,
    };
  }

  async findOne(id: string) {
    const job = await this.calendarJobRepo.findOne({
      where: { id },
      relations: ['event', 'status'],
    });
    if (!job) throw new NotFoundException('CalendarJob no encontrado');

    const progress =
      job.totalEmails > 0
        ? Math.round(((job.processedEmails ?? 0) / job.totalEmails) * 100)
        : 0;

    return {
      id: job.id,
      status: job.status?.status,
      totalEmails: job.totalEmails,
      processedEmails: job.processedEmails,
      failedEmails: job.failedEmails,
      progress: `${progress}%`,
      event: { id: job.event?.id, title: job.event?.title },
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  async findByEvent(eventId: string) {
    return this.calendarJobRepo.find({
      where: { event: { id: eventId } },
      relations: ['status'],
      order: { createdAt: 'DESC' },
    });
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}