import { ApiProperty } from '@nestjs/swagger';
import { 
    IsString, 
    IsNotEmpty, 
    IsDateString, 
    IsBoolean, 
    IsOptional, 
    IsUUID, 
    IsUrl, 
    IsInt 
} from 'class-validator';

export class CreateEventDto {
    @ApiProperty({ example: 'Conferencia de Tecnología', description: 'El título del evento' })
    @IsString() @IsNotEmpty()
    title!: string;

    @ApiProperty({ example: 'Descripción del evento', description: 'La descripción del evento' })
    @IsString() @IsNotEmpty()
    description!: string;

    @ApiProperty({ example: '2023-10-10T10:00:00.000Z', description: 'La fecha de inicio del evento' })
    @IsDateString() @IsNotEmpty()
    dateStart!: string;

    @ApiProperty({ required: false, example: '2023-10-10T10:00:00.000Z', description: 'La fecha de finalización del evento' })
    @IsDateString() @IsOptional()
    dateEnd?: string;

    @ApiProperty({ required: false, example: false, description: 'Indica si el evento es virtual' })
    @IsBoolean() @IsOptional()
    virtual?: boolean;

    @ApiProperty({ required: false, example: 'https://example.com', description: 'Enlace al evento' })
    @IsUrl() @IsOptional()
    link?: string;

    @ApiProperty({ required: false, example: 'https://example.com/video', description: 'Enlace al video del evento' })
    @IsUrl() @IsOptional()
    video?: string;
    
    @ApiProperty({ required: false, example: 'https://example.com/image.jpg', description: 'Enlace a la imagen del evento' })
    @IsUrl() @IsOptional()
    image?: string;
    
    @ApiProperty({ required: false, example: 'Universidad de Antioquia', description: 'Ubicación del evento' })
    @IsString() @IsOptional()
    location?: string;

    @ApiProperty({ required: false, example: 100, description: 'Capacidad del evento' })
    @IsInt() @IsOptional()
    capacity?: number;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID de la categoría del evento' })
    @IsUUID() @IsNotEmpty()
    id_category!: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del estado del evento' })
    @IsUUID() @IsNotEmpty()
    id_status!: string;
}