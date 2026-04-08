import { Module } from '@nestjs/common';
import { CalendarJobsService } from './calendar-jobs.service';
import { CalendarJobsController } from './calendar-jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarJob } from './entities/calendar-job';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarJob])
  ],
  providers: [CalendarJobsService],
  controllers: [CalendarJobsController]
})
export class CalendarJobsModule {}
