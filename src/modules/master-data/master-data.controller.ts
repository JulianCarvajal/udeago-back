import { Controller, Get, Param } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('master-data')
@ApiTags('Categories')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get('status') 
  @ApiOperation({ summary: 'Obtener todos los estados de un evento' })
  findAll() {
    return this.masterDataService.findAllStatus();
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Obtener un estado específico de un evento' })
  findOne(@Param('id') id: string) {
    return this.masterDataService.findOneStatus(id);
  }
}