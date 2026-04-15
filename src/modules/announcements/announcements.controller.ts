import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('announcements')
@ApiTags('Anuncios')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN') // HU17: Crear anuncio
  @ApiOperation({ summary: 'Crear un nuevo anuncio (Solo ADMIN), se necesita pasar el token de autenticación / Requiere listar todos los estados con el controlador de estados' })
  @ApiBody({ type: CreateAnnouncementDto })
  create(@Body() createAnnouncementDto: CreateAnnouncementDto, @Req() req: any) {
    return this.announcementsService.create(createAnnouncementDto, req.user);
  }

  @Get() // PÚBLICO: Estudiantes ven los anuncios
  @ApiOperation({ summary: 'Obtener todos los anuncios' })
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get(':id') // PÚBLICO
  @ApiOperation({ summary: 'Obtener un anuncio específico' })
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN') // HU18: Modificar anuncio
  @ApiOperation({ summary: 'Actualizar un anuncio (Solo ADMIN), se necesita pasar el token de autenticación' })
  @ApiBody({ type: UpdateAnnouncementDto })
  update(@Param('id') id: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN') // HU19: Eliminar anuncio
  @ApiOperation({ summary: 'Eliminar un anuncio (Solo ADMIN), se necesita pasar el token de autenticación' })
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}