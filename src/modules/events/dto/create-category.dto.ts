import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsString() @IsNotEmpty()
  @ApiProperty({ description: 'Nombre de la categoría de eventos', example: 'Conferencias' })
  name!: string;
}