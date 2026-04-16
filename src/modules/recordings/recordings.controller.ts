import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { CreateRecordingDto } from './dto/create-recording.dto';
import { UpdateRecordingDto } from './dto/update-recording.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('recordings')
@Controller('recordings')
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN') // Gestión de grabaciones solo para admins
  @ApiOperation({ summary: 'Crear una nueva grabación' })
  @ApiBody({ type: CreateRecordingDto })
  create(@Body() createRecordingDto: CreateRecordingDto, @Req() req: any) {
    return this.recordingsService.create(createRecordingDto, req.user);
  }

  @Get() // HU21: PÚBLICO para estudiantes
  @ApiOperation({ summary: 'Obtener todas las grabaciones' })
  findAll() {
    return this.recordingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una grabación específica' })
  findOne(@Param('id') id: string) {
    return this.recordingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN') // HU22: Modificar información
  @ApiOperation({ summary: 'Actualizar una grabación existente' })
  @ApiBody({ type: UpdateRecordingDto })
  update(@Param('id') id: string, @Body() updateRecordingDto: UpdateRecordingDto) {
    return this.recordingsService.update(id, updateRecordingDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN') // HU24: Eliminar grabaciones
  @ApiOperation({ summary: 'Eliminar una grabación' })
  remove(@Param('id') id: string) {
    return this.recordingsService.remove(id);
  }
}