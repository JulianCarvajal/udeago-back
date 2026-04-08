import { Module } from '@nestjs/common';
import { ExternalLinksService } from './external-links.service';
import { ExternalLinksController } from './external-links.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalLink } from './entities/external-link.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExternalLink])
  ],
  providers: [ExternalLinksService],
  controllers: [ExternalLinksController]
})
export class ExternalLinksModule {}
