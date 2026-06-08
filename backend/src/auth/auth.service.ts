import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, AccountStatus } from '@prisma/client';
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

  async register(dto: RegisterDto, certificateUrl?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    if (dto.role === 'MENTOR') {
      throw new UnauthorizedException('Mentors cannot register through this endpoint.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userRole = ((dto.role as string) || 'LEARNER') as Role;
    
    let organizationId = undefined;
    const isEmployerOrInstitution = userRole === Role.EMPLOYER || userRole === Role.INSTITUTION;
    const status = isEmployerOrInstitution ? ('PENDING' as any) : ('ACTIVE' as any);

    if (userRole === Role.EMPLOYER) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const org = await (this.prisma.organization.create as any)({
        data: { name: `${dto.name} Company`, type: 'EMPLOYER', companyCertificate: certificateUrl }
      });
      organizationId = org.id;
    } else if (userRole === Role.INSTITUTION) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const org = await (this.prisma.organization.create as any)({
        data: { name: `${dto.name} Institution`, type: 'INSTITUTION', trainingCertificate: certificateUrl }
      });
      organizationId = org.id;
    }

    let user;
    try {
      user = await this.prisma.user.create({
        data: { 
          name: dto.name, 
          email: dto.email, 
          phone: dto.phone?.trim() || undefined, 
          passwordHash, 
          role: userRole, 
          status,
          organizationId 
        },
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Email or phone number already in use');
      }
      throw error;
    }

    try {
      if (isEmployerOrInstitution) {
        // Send email to admin about new registration
        // Assuming admin email is known or could be fetched
        await this.notifications.sendAdminReviewEmail('admin@hanga.works', user.email, userRole);
      }
      await this.notifications.sendRegistrationConfirmation(user.email, user.name);
      await this.issueEmailVerification(user.id, user.email, user.name);
    } catch (err) {
      console.error('Failed to send registration email', err);
    }

    await this.notifications.createInApp(user.id, 'welcome', {
      title: 'Welcome to Hanga Works',
      message: 'Complete your profile and verify your email to get started.',
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (user as any).passwordHash;
    return user;
  }

  async issueEmailVerification(userId: string, email: string, name: string) {
    const token = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpires = new Date();
    emailVerifyExpires.setHours(emailVerifyExpires.getHours() + 24);

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerifyToken: token, emailVerifyExpires, emailVerified: false },
    });

    await this.notifications.sendEmailVerification(email, name, token);
    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    await this.notifications.createInApp(user.id, 'email-verified', {
      title: 'Email verified',
      message: 'Your email address has been confirmed.',
    });

    return { message: 'Email verified successfully' };
  }

  async resendEmailVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.emailVerified) {
      return { message: 'Email is already verified' };
    }

    return this.issueEmailVerification(user.id, user.email, user.name);
  }

  async login(dto: LoginDto) {
    console.log('LOGIN ATTEMPT:', dto);
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    console.log('USER FOUND:', user ? user.email : 'null');
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    console.log('PASSWORD MATCH:', isMatch);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    if ((user.status as any) === 'PENDING') {
      throw new UnauthorizedException('Your account is pending admin approval.');
    }

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

  async refreshToken(token: string | undefined) {
    if (!token) {
      throw new UnauthorizedException('Refresh token missing');
    }

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

  async registerMentor(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone?.trim() || undefined,
        passwordHash,
        role: 'MENTOR',
        status: 'ACTIVE',
      },
    });

    await this.prisma.mentorProfile.create({
      data: {
        userId: user.id,
        expertise: 'General',
      },
    });

    try {
      await this.notifications.sendRegistrationConfirmation(user.email, user.name);
      await this.issueEmailVerification(user.id, user.email, user.name);
    } catch (err) {
      console.error('Failed to send mentor registration email', err);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (user as any).passwordHash;
    return user;
  }
}