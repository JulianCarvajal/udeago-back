import { Module, Global } from '@nestjs/common'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './entities/status.entity';

@Global() 
@Module({
  imports: [TypeOrmModule.forFeature([Status])],
  exports: [TypeOrmModule],
})
export class MasterDataModule {}