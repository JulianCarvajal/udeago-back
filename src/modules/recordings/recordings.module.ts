import { Module } from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { RecordingsController } from './recordings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recording } from './entities/recording.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recording])
  ],
  providers: [RecordingsService],
  controllers: [RecordingsController]
})
export class RecordingsModule {}
