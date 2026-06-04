const fs = require('fs');
const path = require('path');

const files = {
  'src/auth/auth.module.ts': `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '15m' },
    }),
    NotificationsModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}`,
  'src/auth/auth.controller.ts': `import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token: result.access_token, user: result.user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: Request) {
    const token = req.cookies['refresh_token'];
    return this.authService.refreshToken(token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['refresh_token'];
    if (token) await this.authService.logout(token);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}`,
  'src/auth/auth.service.ts': `import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';
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
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, role: dto.role || 'LEARNER' },
    });

    await this.notifications.sendRegistrationConfirmation(user.email, user.name);
    
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
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

    const { passwordHash: _, ...result } = user;
    return { access_token, refresh_token, user: result };
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
}`,
  'src/auth/dto/register.dto.ts': `import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';\nexport class RegisterDto { @IsString() @IsNotEmpty() name: string; @IsEmail() email: string; @IsString() @MinLength(6) password: string; @IsString() role?: any; }`,
  'src/auth/dto/login.dto.ts': `import { IsEmail, IsNotEmpty, IsString } from 'class-validator';\nexport class LoginDto { @IsEmail() email: string; @IsString() @IsNotEmpty() password: string; }`,
  'src/auth/dto/forgot-password.dto.ts': `import { IsEmail } from 'class-validator';\nexport class ForgotPasswordDto { @IsEmail() email: string; }`,
  'src/auth/dto/reset-password.dto.ts': `import { IsNotEmpty, IsString, MinLength } from 'class-validator';\nexport class ResetPasswordDto { @IsString() @IsNotEmpty() token: string; @IsString() @MinLength(6) newPassword: string; }`,
  'src/auth/strategies/jwt.strategy.ts': `import { Injectable } from '@nestjs/common';\nimport { PassportStrategy } from '@nestjs/passport';\nimport { ExtractJwt, Strategy } from 'passport-jwt';\nimport { PrismaService } from '../../prisma/prisma.service';\n\n@Injectable()\nexport class JwtStrategy extends PassportStrategy(Strategy) {\n  constructor(private prisma: PrismaService) {\n    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: process.env.JWT_SECRET || 'secretKey' });\n  }\n  async validate(payload: any) {\n    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });\n    return user;\n  }\n}`,
  'src/auth/guards/jwt-auth.guard.ts': `import { Injectable } from '@nestjs/common';\nimport { AuthGuard } from '@nestjs/passport';\n@Injectable()\nexport class JwtAuthGuard extends AuthGuard('jwt') {}`,
  'src/auth/guards/roles.guard.ts': `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';\nimport { Reflector } from '@nestjs/core';\n@Injectable()\nexport class RolesGuard implements CanActivate {\n  constructor(private reflector: Reflector) {}\n  canActivate(context: ExecutionContext): boolean {\n    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [context.getHandler(), context.getClass()]);\n    if (!requiredRoles) return true;\n    const { user } = context.switchToHttp().getRequest();\n    return requiredRoles.includes(user?.role);\n  }\n}`,
  'src/auth/decorators/roles.decorator.ts': `import { SetMetadata } from '@nestjs/common';\nexport const Roles = (...roles: string[]) => SetMetadata('roles', roles);`,
  'src/auth/decorators/current-user.decorator.ts': `import { createParamDecorator, ExecutionContext } from '@nestjs/common';\nexport const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {\n  const req = ctx.switchToHttp().getRequest();\n  return { ...req.user, userId: req.user?.id || req.user?.userId };\n});`
};

for (const [filePath, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}
