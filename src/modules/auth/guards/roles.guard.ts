import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true; // Si la ruta no tiene @Roles, se permite

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción.');
    }
    
    return true;
  }
}