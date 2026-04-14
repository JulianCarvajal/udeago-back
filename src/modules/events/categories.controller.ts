import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('categories')
@ApiTags('Categorías de Eventos')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get() 
  @ApiOperation({ summary: 'Obtener todas las categorías de eventos' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post() // Solo admins pueden crear nuevas categorías
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva categoría de eventos (Solo ADMIN)' })
  @ApiBody({ type: CreateCategoryDto })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
}