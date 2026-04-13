import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @ApiOperation({ summary: 'Pantalla de inicio de sesion con google' })
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @ApiOperation({ summary: 'Brinda el token de acceso junto con informacion adicional' })
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
    // 1. Obtenemos la sesión desde el servicio
    const session = await this.authService.googleLogin(req);

    // 2. Serializamos el usuario para la URL (URL Encoding)
    const userJson = encodeURIComponent(JSON.stringify(session.user));
    
    // 3. Construimos la URL con el Hash # (Opción recomendada por el front)
    const redirectUrl = `http://localhost:5173/admin/auth/callback#access_token=${session.access_token}&expires_in=3600&user=${userJson}`;

    // 4. Redirigimos al frontend
    return res.redirect(redirectUrl);

  } catch (error) {
    // Si falla la whitelist o cualquier cosa, enviamos al front con error
    return res.redirect('http://localhost:5173/admin/auth/callback?error=forbidden');
  }
  }
}