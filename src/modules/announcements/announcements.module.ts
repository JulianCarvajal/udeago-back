import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from './entities/announcement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement])
  ],
  providers: [AnnouncementsService],
  controllers: [AnnouncementsController]
})
export class AnnouncementsModule {}
