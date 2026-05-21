import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CalendarJobsController } from './calendar-jobs.controller';
import { CalendarJobsService } from './calendar-jobs.service';
import { CalendarJobsProcessor, CALENDAR_QUEUE } from './calendar-jobs.processor';
import { CalendarJob } from './entities/calendar-job';
import { Event } from '../events/entities/event.entity';
import { Status } from '../master-data/entities/status.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarJob, Event, Status, User]),
    BullModule.registerQueue({ name: CALENDAR_QUEUE }),
  ],
  controllers: [CalendarJobsController],
  providers: [CalendarJobsService, CalendarJobsProcessor],
})
export class CalendarJobsModule {}