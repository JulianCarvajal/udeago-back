import { Module } from '@nestjs/common';
import { AdminWhiteList } from '../users/entities/admin-whitelist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../users/entities/role.entity';
import { Status } from '../master-data/entities/status.entity';
import { SeedService } from './seed.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Role, Status, AdminWhiteList]),
    ],
    providers: [SeedService],
})
export class SeederModule {}
