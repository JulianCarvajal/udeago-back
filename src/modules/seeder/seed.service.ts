import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../users/entities/role.entity';
import { Status } from '../master-data/entities/status.entity';
import { AdminWhiteList } from '../users/entities/admin-whitelist.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Status) private statusRepo: Repository<Status>,
    @InjectRepository(AdminWhiteList) private whitelistRepo: Repository<AdminWhiteList>,
  ) {}

  async onModuleInit() {
    console.log('Iniciando Seeding de base de datos...');

    // 1. Crear Roles si no existen
    const adminExists = await this.roleRepo.findOne({ where: { rol: 'ADMIN' } });
    if (!adminExists) {
      await this.roleRepo.save(this.roleRepo.create({ rol: 'ADMIN' }));
      console.log('Rol ADMIN creado.');
    }

    // 2. Crear Status iniciales
    const statusNames = ['ACTIVO', 'INACTIVO', 'PROGRAMADO', 'CANCELADO', 'ELIMINADO', 'COMPLETADO', 'FALLIDO'];
    for (const name of statusNames) {
      const exists = await this.statusRepo.findOne({ where: { status: name } });
      if (!exists) {
        await this.statusRepo.save(this.statusRepo.create({ status: name }));
      }
    }

    // 3. Crear Email inicial en Whitelist
    const myEmail = 'cristian.carvajalm@udea.edu.co';
    const emailExists = await this.whitelistRepo.findOne({ where: { email: myEmail } });
    if (!emailExists) {
      await this.whitelistRepo.save(this.whitelistRepo.create({ email: myEmail }));
      console.log(`Email ${myEmail} añadido a la whitelist.`);
    }

    console.log('Seeding completado con éxito.');
  }
}