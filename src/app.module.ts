import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { EventsModule } from './modules/events/events.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { RecordingsModule } from './modules/recordings/recordings.module';
import { ExternalLinksModule } from './modules/external-links/external-links.module';
import { CalendarJobsModule } from './modules/calendar-jobs/calendar-jobs.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    
    TypeOrmModule.forRootAsync({
      inject: [ConfigService], // Inyectamos el servicio para asegurar que las variables ya cargaron
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Solo en desarrollo
        logging: true,
      }),
    }),
    
    UsersModule, 
    MasterDataModule, 
    EventsModule, 
    AnnouncementsModule, 
    RecordingsModule, 
    ExternalLinksModule,
    CalendarJobsModule,
    AuthModule,
    SeederModule],
    controllers: [AppController],
    providers: [AppService],
  })
  
export class AppModule { }
