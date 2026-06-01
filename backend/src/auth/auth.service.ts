import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notifications: NotificationsService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userRole = (dto.role || 'LEARNER') as Role;
    
    let organizationId = undefined;
    if (userRole === Role.EMPLOYER) {
      const org = await this.prisma.organization.create({
        data: { name: `${dto.name} Company`, type: 'EMPLOYER' }
      });
      organizationId = org.id;
    } else if (userRole === Role.INSTITUTION) {
      const org = await this.prisma.organization.create({
        data: { name: `${dto.name} Institution`, type: 'INSTITUTION' }
      });
      organizationId = org.id;
    }

    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, role: userRole, organizationId },
    });

    await this.notifications.sendRegistrationConfirmation(user.email, user.name);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (user as any).passwordHash;
    return user;
  }

  async login(dto: LoginDto) {
    console.log('LOGIN ATTEMPT:', dto);
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    console.log('USER FOUND:', user ? user.email : 'null');
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    console.log('PASSWORD MATCH:', isMatch);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    const refresh_token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, token: refresh_token, expiresAt },
    });

    this.notifications.emitUserLoggedIn(user.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (user as any).passwordHash;
    return { access_token, refresh_token, user };
  }

  async refreshToken(token: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token }, include: { user: true },
    });
    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const payload = { sub: storedToken.user.id, email: storedToken.user.email, role: storedToken.user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async logout(token: string) {
    if (!token) return;
    await this.prisma.refreshToken.updateMany({
      where: { token }, data: { isRevoked: true },
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setMinutes(resetTokenExpires.getMinutes() + 15);

    await this.prisma.user.update({
      where: { id: user.id }, data: { resetToken, resetTokenExpires },
    });

    await this.notifications.sendPasswordReset(user.email, resetToken);

    return { message: 'If that email exists, a reset link has been sent.', resetToken };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: dto.token, resetTokenExpires: { gt: new Date() } },
    });
    if (!user) throw new UnauthorizedException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null },
    });

    return { message: 'Password successfully reset' };
  }
}