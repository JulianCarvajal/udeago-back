import { Module, Global } from '@nestjs/common'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './entities/status.entity';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';

@Global() 
@Module({
  imports: [TypeOrmModule.forFeature([Status])],
  exports: [TypeOrmModule, MasterDataService],
  controllers: [MasterDataController],
  providers: [MasterDataService],
})
export class MasterDataModule {}