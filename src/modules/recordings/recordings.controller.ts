import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { use } from 'passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('recordings')
@ApiTags('Recordings')
export class RecordingsController {

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege la ruta con JWT y verifica roles
    @Roles('ADMIN') // Solo los usuarios con el rol 'admin' pueden acceder a esta ruta
    @ApiOperation({ summary: 'Test' })
    getAllRecordings() {
        return "Aquí iría la lógica para obtener todas las grabaciones";
    }

}
