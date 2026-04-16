import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recording } from './entities/recording.entity';
import { CreateRecordingDto } from './dto/create-recording.dto';
import { UpdateRecordingDto } from './dto/update-recording.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RecordingsService {
  constructor(
    @InjectRepository(Recording)
    private readonly recordingRepository: Repository<Recording>,
  ) {}

  async create(createRecordingDto: CreateRecordingDto, user: User) {
    const recording = this.recordingRepository.create({
      ...createRecordingDto,
      user: user,
      status: { id: createRecordingDto.id_status },
      // Si viene id_event, se asocia, si no, queda null
      event: createRecordingDto.id_event ? { id: createRecordingDto.id_event } : undefined,
    });
    return await this.recordingRepository.save(recording);
  }

  async findAll() {
    return await this.recordingRepository.find({
      relations: ['status', 'user', 'event'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const recording = await this.recordingRepository.findOne({
      where: { id },
      relations: ['status', 'user', 'event'],
    });
    if (!recording) throw new NotFoundException('Grabación no encontrada');
    return recording;
  }

  async update(id: string, updateRecordingDto: UpdateRecordingDto) {
    const recording = await this.recordingRepository.preload({
      id,
      ...updateRecordingDto,
      event: updateRecordingDto.id_event ? { id: updateRecordingDto.id_event } : undefined,
      status: updateRecordingDto.id_status ? { id: updateRecordingDto.id_status } : undefined,
    });
    if (!recording) throw new NotFoundException('Grabación no encontrada');
    return await this.recordingRepository.save(recording);
  }

  // HU24: Eliminar grabaciones
  async remove(id: string) {
    const recording = await this.findOne(id);
    return await this.recordingRepository.softRemove(recording);
  }
}