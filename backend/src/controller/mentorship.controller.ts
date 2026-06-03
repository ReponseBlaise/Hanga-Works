import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MentorshipService } from '../mentorship/mentorship.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMentorDto } from '../mentorship/dto/create-mentor.dto';
import { BookSessionDto } from '../mentorship/dto/book-session.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mentorship')
export class MentorshipController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  @Roles('MENTOR')
  @Post('profile')
  async createProfile(
    @Request() req: { user: { userId: string } },
    @Body() createMentorDto: CreateMentorDto,
  ) {
    return this.mentorshipService.createProfile(req.user.userId, createMentorDto);
  }

  @Roles('INSTITUTION', 'ADMIN')
  @Post('create')
  async createInstitutionMentor(
    @Request() req: { user: { userId: string } },
    @Body() data: { name: string, email: string, expertise: string, hourlyRate?: number },
  ) {
    return this.mentorshipService.createInstitutionMentor(req.user.userId, data);
  }

  @Get('mentors')
  async getMentors() {
    return this.mentorshipService.findAllMentors();
  }

  @Post('sessions/book')
  async bookSession(
    @Request() req: { user: { userId: string } },
    @Body() bookSessionDto: BookSessionDto,
  ) {
    return this.mentorshipService.bookSession(req.user.userId, bookSessionDto);
  }

  @Get('sessions')
  async getSessions(@Request() req: { user: { userId: string, role: string } }) {
    return this.mentorshipService.getMySessions(req.user.userId, req.user.role);
  }
}
