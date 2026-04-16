import { ApiProperty } from '@nestjs/swagger';
import { 
    IsString, 
    IsNotEmpty, 
    IsUrl, 
    IsOptional, 
    IsUUID 
} from 'class-validator';

export class CreateRecordingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Grabacion Hackathon', description: 'Titulo de la grabación' })
  title!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Grabación de la hackathon del 2023', description: 'Descripción de la grabación' })
  description?: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({ example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Enlace a la grabación' })
  link!: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Enlace a la imagen de la grabación' })
  image?: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del estado de la grabación' })
  id_status!: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del evento asociado a la grabación' })
  id_event?: string;
}