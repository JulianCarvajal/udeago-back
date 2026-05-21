import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @ApiOperation({ summary: 'Pantalla de inicio de sesion con google' })
  googleAuth(@Res() res: Response) {
    // Construimos la URL de autorización manualmente para poder pasar
    // access_type=offline y prompt=consent.
    const params = new URLSearchParams({
      client_id: this.configService.get<string>('GOOGLE_CLIENT_ID')!,
      redirect_uri: this.configService.get<string>('GOOGLE_CALLBACK_URL')!,
      response_type: 'code',
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar',
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    );
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Brinda el token de acceso junto con informacion adicional' })
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      const session = await this.authService.googleLogin(req);
      const userJson = encodeURIComponent(JSON.stringify(session.user));
      const redirectUrl = `http://localhost:5173/admin/auth/callback#access_token=${session.access_token}&expires_in=3600&user=${userJson}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      return res.redirect('http://localhost:5173/admin/auth/callback?error=forbidden');
    }
  }
}