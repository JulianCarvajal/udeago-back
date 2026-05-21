import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as XLSX from 'xlsx';
import { CalendarJobsService } from './calendar-jobs.service';
import { CreateCalendarJobDto } from './dto/create-calendar-job.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('calendar-jobs')
@ApiTags('Carga masiva de invitaciones (Calendar Jobs)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class CalendarJobsController {
  constructor(private readonly calendarJobsService: CalendarJobsService) {}

  /**
   * POST /calendar-jobs
   * Recibe id_event + array de emails en JSON (uso original).
   */
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Iniciar carga masiva enviando los emails en el body JSON' })
  create(@Body() dto: CreateCalendarJobDto, @Req() req: any) {
    return this.calendarJobsService.create(dto, req.user.userId);
  }

  /**
   * POST /calendar-jobs/upload/:eventId
   * Recibe un archivo Excel (.xlsx / .xls) con una sola columna de correos.
   * La primera fila puede ser un encabezado (ej: "Email") — se ignora
   * automáticamente si no tiene formato de correo válido.
   *
   * Formato esperado del Excel:
   *   A1: Email              ← encabezado opcional
   *   A2: est1@udea.edu.co
   *   A3: est2@gmail.com
   *   ...
   */
  @Post('upload/:eventId')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Iniciar carga masiva subiendo un archivo Excel con los correos (una columna)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // sin tocar el disco — el buffer va directo a xlsx
      limits: { fileSize: 5 * 1024 * 1024 }, // máx 5 MB
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten archivos .xlsx o .xls'), false);
        }
      },
    }),
  )
  async createFromExcel(
    @Param('eventId') eventId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    // Parsear el Excel desde el buffer en memoria
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!rows || rows.length === 0) {
      throw new BadRequestException('El archivo Excel está vacío');
    }

    // Extraer la primera columna, ignorar vacíos y encabezados no-email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails: string[] = rows
      .map((row) => String(row[0] ?? '').trim())
      .filter((val) => emailRegex.test(val));

    if (emails.length === 0) {
      throw new BadRequestException(
        'No se encontraron correos válidos en la primera columna del archivo',
      );
    }

    const dto: CreateCalendarJobDto = { id_event: eventId, emails };
    return this.calendarJobsService.create(dto, req.user.userId);
  }

  /**
   * GET /calendar-jobs/:id
   * Polling de estado y progreso.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Consultar estado y progreso de una carga masiva (polling)' })
  findOne(@Param('id') id: string) {
    return this.calendarJobsService.findOne(id);
  }

  /**
   * GET /calendar-jobs/event/:eventId
   * Historial de cargas masivas de un evento.
   */
  @Get('event/:eventId')
  @ApiOperation({ summary: 'Historial de cargas masivas de un evento' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.calendarJobsService.findByEvent(eventId);
  }
}