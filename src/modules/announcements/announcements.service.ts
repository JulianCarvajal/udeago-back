import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { User } from '../users/entities/user.entity';
import { MasterDataService } from '../master-data/master-data.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    private readonly masterDataService: MasterDataService,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, user: User) {
    const announcement = this.announcementRepository.create({
      ...createAnnouncementDto,
      user: user,
      status: { id: createAnnouncementDto.id_status },
    });
    return await this.announcementRepository.save(announcement);
  }

  async findAll() {
    return await this.announcementRepository.find({
      relations: ['status', 'user'],
      order: { date: 'DESC' }, // Los más recientes primero
    });
  }

  async findOne(id: string) {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
      relations: ['status', 'user'],
    });
    if (!announcement) throw new NotFoundException('Anuncio no encontrado');
    return announcement;
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto) {
    const announcement = await this.announcementRepository.preload({
      id,
      ...updateAnnouncementDto,
      status: updateAnnouncementDto.id_status ? { id: updateAnnouncementDto.id_status } : undefined,
    });
    if (!announcement) throw new NotFoundException('Anuncio no encontrado');
    return await this.announcementRepository.save(announcement);
  }

  // HU19: Eliminar anuncios (Soft Delete)
  async remove(id: string) {
    const announcement = await this.findOne(id);
    const cancelledStatus = this.masterDataService.getStatusByName('ELIMINADO');
    announcement.status = { id: (await cancelledStatus).id } as any;
    await this.announcementRepository.save(announcement);   
    return await this.announcementRepository.softRemove(announcement);
  }
}