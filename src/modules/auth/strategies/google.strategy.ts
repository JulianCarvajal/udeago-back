import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminWhiteList } from '../../users/entities/admin-whitelist.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    @InjectRepository(AdminWhiteList)
    private readonly whitelistRepository: Repository<AdminWhiteList>,
  ) {
    super({
        clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
        clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
        callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
        scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { emails, displayName, photos, id } = profile;
    const email = emails[0].value;

    const isWhitelisted = await this.whitelistRepository.findOne({ where: { email } });

    if (!isWhitelisted) {
      return done(new UnauthorizedException('Tu correo institucional no está autorizado para acceder.'), false);
    }

    const user = {
      email,
      firstName: displayName,
      picture: photos[0].value,
      providerId: id,
      accessToken,
    };

    done(null, user);
  }
}