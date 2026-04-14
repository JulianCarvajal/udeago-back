import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/entities/user.entity';
import { MasterDataService } from '../master-data/master-data.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly masterDataService: MasterDataService,
  ) {}

  async create(createEventDto: CreateEventDto, user: User) {
    const event = this.eventRepository.create({
      ...createEventDto,
      manager: user, // Asignamos al admin que crea el evento
      category: { id: createEventDto.id_category },
      status: { id: createEventDto.id_status },
      pubDate: new Date(),
    });
    return await this.eventRepository.save(event);
  }

  async findAll() {
    return await this.eventRepository.find({
      relations: ['category', 'status', 'manager'],
      order: { dateStart: 'ASC' },
      withDeleted: true, // Incluye eventos cancelados (soft deleted)
    });
  }

  async findOne(id: string) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['category', 'status', 'manager'],
      withDeleted: true, // Permite encontrar eventos cancelados (soft deleted)
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.eventRepository.preload({
      id,
      ...updateEventDto,
      category: updateEventDto.id_category ? { id: updateEventDto.id_category } : undefined,
      status: updateEventDto.id_status ? { id: updateEventDto.id_status } : undefined,
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return await this.eventRepository.save(event);
  }

  // HU06: Cancelar evento (Soft Delete o cambio de estado)
  async remove(id: string) {
    const event = await this.findOne(id);
    const cancelledStatus = this.masterDataService.getStatusByName('CANCELADO');
    event.status = { id: (await cancelledStatus).id } as any;
    console.log(`ID de status CANCELADO: ${(await cancelledStatus).id}`);
    await this.eventRepository.save(event);
    console.log(`Evento con ID ${id} marcado como ${cancelledStatus}`);
    return await this.eventRepository.softRemove(event);
  }
}