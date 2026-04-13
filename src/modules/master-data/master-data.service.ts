import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from './entities/status.entity';

@Injectable()
export class MasterDataService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}

  async findAllStatus() {
    return await this.statusRepository.find({
      order: { status: 'ASC' },
    });
  }

  async findOneStatus(id: string) {
    const status = await this.statusRepository.findOne({ where: { id } });
    if (!status) throw new NotFoundException(`Status con ID ${id} no encontrado`);
    return status;
  }

  async getStatusByName(name: string) {
    const status = await this.statusRepository.findOne({ where: { status: name } });
    if (!status) throw new NotFoundException(`Status con nombre ${name} no encontrado`);
    console.log(`Status encontrado: ${status.status} con ID: ${status.id}`);
    return status;
  }
}