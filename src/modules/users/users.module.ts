import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { AdminWhiteList } from './entities/admin-whitelist.entity';

@Module({
  imports: [
    // Esto registra las entidades de este módulo específico
    TypeOrmModule.forFeature([User, Role, AdminWhiteList])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule] // Exportamos para que Auth pueda usar el repositorio de User
})
export class UsersModule {}