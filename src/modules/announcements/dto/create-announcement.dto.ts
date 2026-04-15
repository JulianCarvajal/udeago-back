import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional, IsDateString, IsString } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Mantenimiento programado', description: 'Título del anuncio' })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Se realizará mantenimiento programado en el sistema', description: 'Descripción del anuncio' })
  description!: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del estado del anuncio' })
  id_status!: string;
}