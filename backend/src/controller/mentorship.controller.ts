import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
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
    @Body() data: { name: string, email: string, password?: string, expertise: string, hourlyRate?: number },
  ) {
    return this.mentorshipService.createInstitutionMentor(req.user.userId, data);
  }

  @Get('mentors')
  async getMentors() {
    return this.mentorshipService.findAllMentors();
  }

  @Get('mentors/:id')
  async getMentorById(@Param('id') id: string) {
    return this.mentorshipService.findMentorById(id);
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

  @Roles('MENTOR')
  @Patch('sessions/:id/accept')
  async acceptSession(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.mentorshipService.acceptSession(id, req.user.userId);
  }

  @Roles('MENTOR')
  @Patch('sessions/:id/reject')
  async rejectSession(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.mentorshipService.rejectSession(id, req.user.userId);
  }

  @Roles('MENTOR')
  @Patch('sessions/:id/complete')
  async completeSession(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.mentorshipService.completeSession(id, req.user.userId);
  }

  @Post('sessions/:id/review')
  async addReview(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
    @Body() body: { rating: number; feedback?: string },
  ) {
    return this.mentorshipService.addReview(id, req.user.userId, body.rating, body.feedback);
  }
}
