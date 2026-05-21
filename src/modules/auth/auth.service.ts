import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async googleLogin(req: any) {
    console.log('*************************************************');
    console.log('refreshToken', req.user.refreshToken);
    if (!req.user) throw new UnauthorizedException('No se recibió usuario de Google');

    let user = await this.userRepository.findOne({
      where: { email: req.user.email },
      relations: ['role'],
    });

    if (!user) {
      const adminRole = await this.roleRepository.findOne({ where: { rol: 'ADMIN' } });
      if (!adminRole) {
        throw new Error('El rol ADMIN no ha sido inicializado en la base de datos.');
      }

      user = this.userRepository.create({
        email: req.user.email,
        name: req.user.firstName,
        avatarUrl: req.user.picture,
        providerId: req.user.providerId,
        role: adminRole,
        lastLogin: new Date(),
        googleRefreshToken: req.user.refreshToken ?? null,
      });
    } else {
      user.lastLogin = new Date();
      if (req.user.refreshToken) {
        user.googleRefreshToken = req.user.refreshToken;
      }
    }

    await this.userRepository.save(user);

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role?.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}