import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, IsEmail, ArrayMinSize } from 'class-validator';

export class CreateCalendarJobDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del evento al que se invitarán los asistentes',
  })
  @IsUUID()
  id_event!: string;

  @ApiProperty({
    example: ['estudiante1@udea.edu.co', 'estudiante2@gmail.com'],
    description:
      'Lista completa de correos a invitar (institucionales y externos). ' +
      'Se deduplicarán automáticamente antes de procesarlos.',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  emails!: string[];
}