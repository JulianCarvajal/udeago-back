import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import { CalendarJob } from './entities/calendar-job';
import { Status } from '../master-data/entities/status.entity';
import { User } from '../users/entities/user.entity';

export const CALENDAR_QUEUE = 'calendar-invites';

export interface InviteBatchPayload {
  calendarJobId: string;
  adminUserId: string;   // ID del admin — el processor busca el token en BD
  eventTitle: string;
  eventDescription: string;
  eventStart: string;
  eventEnd: string;
  eventLocation?: string;
  batchIndex: number;
  totalBatches: number;
  emails: string[];
}

@Processor(CALENDAR_QUEUE, { concurrency: 1 })
export class CalendarJobsProcessor extends WorkerHost {
  private readonly logger = new Logger(CalendarJobsProcessor.name);
  private readonly calendarId: string;

  constructor(
    @InjectRepository(CalendarJob)
    private readonly calendarJobRepo: Repository<CalendarJob>,

    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly config: ConfigService,
  ) {
    super();
    this.calendarId = config.get<string>('GOOGLE_CALENDAR_ID') ?? 'primary';
  }

  /**
   * Lee el refreshToken del admin desde BD via TypeORM.
   * Esto garantiza que el EncryptionTransformer lo descifra correctamente
   * antes de pasarlo a la API de Google.
   */
  private async getCalendarClient(adminUserId: string): Promise<calendar_v3.Calendar> {
    const admin = await this.userRepo.findOne({ where: { id: adminUserId } });

    if (!admin?.googleRefreshToken) {
      throw new Error(`El admin ${adminUserId} no tiene refreshToken de Google Calendar.`);
    }

    // En este punto TypeORM ya aplicó el EncryptionTransformer → token en claro
    const refreshToken = admin.googleRefreshToken;

    this.logger.debug(`Token leído de BD (primeros 10 chars): ${refreshToken.substring(0, 10)}...`);

    const auth = new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
    );
    auth.setCredentials({ refresh_token: refreshToken });

    return google.calendar({ version: 'v3', auth });
  }

  async process(job: Job<InviteBatchPayload>): Promise<void> {
    const {
      calendarJobId,
      adminUserId,
      batchIndex,
      totalBatches,
      emails,
      eventTitle,
      eventDescription,
      eventStart,
      eventEnd,
      eventLocation,
    } = job.data;

    this.logger.log(
      `[${calendarJobId}] Lote ${batchIndex + 1}/${totalBatches} · ${emails.length} correos`,
    );

    // Obtener cliente de Calendar con token descifrado desde BD
    const calendar = await this.getCalendarClient(adminUserId);

    try {
      let googleEventId: string;

      if (batchIndex === 0) {
        // ── Lote 0: crear el evento en Google Calendar ────────────────────────
        const response = await calendar.events.insert({
          calendarId: this.calendarId,
          sendUpdates: 'none',
          requestBody: {
            summary: eventTitle,
            description: eventDescription,
            start: { dateTime: eventStart, timeZone: 'America/Bogota' },
            end:   { dateTime: eventEnd,   timeZone: 'America/Bogota' },
            location: eventLocation,
            attendees: emails.map((email) => ({ email })),
            guestsCanInviteOthers: false,
            guestsCanSeeOtherGuests: false,
          },
        });

        googleEventId = response.data.id!;

        // Guardamos el googleEventId en errorLog (jsonb) para que los
        // lotes siguientes lo lean desde BD
        await this.calendarJobRepo.update(calendarJobId, {
          errorLog: { 
            googleEventId,
           } as any, // TypeORM no infiere bien el tipo para jsonb, se necesita un cast
        });

        this.logger.log(`[${calendarJobId}] Evento GCal creado: ${googleEventId}`);

      } else {
        // ── Lotes 1..N: leer googleEventId y agregar asistentes ───────────────
        const record = await this.calendarJobRepo.findOne({
          where: { id: calendarJobId },
        });
        googleEventId = record?.errorLog?.googleEventId;

        if (!googleEventId) {
          throw new Error('googleEventId no disponible. El lote 0 no completó correctamente.');
        }

        const current = await calendar.events.get({
          calendarId: this.calendarId,
          eventId: googleEventId,
          fields: 'attendees',
        });

        const existingSet = new Set(
          (current.data.attendees ?? []).map((a) => a.email!.toLowerCase()),
        );

        const toAdd = emails
          .filter((e) => !existingSet.has(e.toLowerCase()))
          .map((email) => ({ email }));

        await calendar.events.patch({
          calendarId: this.calendarId,
          eventId: googleEventId,
          sendUpdates: 'none',
          requestBody: {
            attendees: [...(current.data.attendees ?? []), ...toAdd],
          },
        });

        this.logger.log(
          `[${calendarJobId}] Lote ${batchIndex + 1}: +${toAdd.length} asistentes`,
        );
      }

      // ── Actualizar processedEmails de forma atómica ───────────────────────
      await this.calendarJobRepo
        .createQueryBuilder()
        .update(CalendarJob)
        .set({ processedEmails: () => `processed_emails + ${emails.length}` })
        .where('id = :id', { id: calendarJobId })
        .execute();

      // ── Último lote: enviar invitaciones y marcar COMPLETADO ───────────────
      if (batchIndex === totalBatches - 1) {
        const record = await this.calendarJobRepo.findOne({
          where: { id: calendarJobId },
        });
        const finalEventId = record?.errorLog?.googleEventId;

        await calendar.events.patch({
          calendarId: this.calendarId,
          eventId: finalEventId,
          sendUpdates: 'all',
          requestBody: {},
        });

        const completedStatus = await this.statusRepo.findOne({
          where: { status: 'COMPLETADO' },
        });

        await this.calendarJobRepo.update(calendarJobId, {
          status: completedStatus ?? undefined,
          errorLog: undefined,
        });

        this.logger.log(`[${calendarJobId}] ✅ Completado. Invitaciones enviadas.`);
      }

    } catch (error: any) {
      const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 1) - 1;
      this.logger.error(
        `[${calendarJobId}] ❌ Error en lote ${batchIndex}: ${error.message}`,
      );

      if (isLastAttempt) {
        const record = await this.calendarJobRepo.findOne({
          where: { id: calendarJobId },
        });

        await this.calendarJobRepo
          .createQueryBuilder()
          .update(CalendarJob)
          .set({ failedEmails: () => `failed_emails + ${emails.length}` })
          .where('id = :id', { id: calendarJobId })
          .execute();

        const updatedLog = {
          ...(record?.errorLog ?? {}),
          [`batch_${batchIndex}`]: {
            error: error.message,
            timestamp: new Date().toISOString(),
          },
        };

        if (batchIndex === totalBatches - 1) {
          const failedStatus = await this.statusRepo.findOne({
            where: { status: 'FALLIDO' },
          });
          await this.calendarJobRepo.update(calendarJobId, {
            errorLog: updatedLog,
            status: failedStatus ?? undefined,
          });
        } else {
          await this.calendarJobRepo.update(calendarJobId, { errorLog: updatedLog });
        }
      }

      throw error;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job [${job.id}] falló definitivamente: ${error.message}`);
  }
}