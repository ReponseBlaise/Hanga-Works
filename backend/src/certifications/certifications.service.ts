import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from './pdf.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class CertificationsService {
  private readonly logger = new Logger(CertificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: PdfService,
    private readonly storage: StorageService,
  ) {}

  // Called automatically when enrollment reaches COMPLETED
  async issue(userId: string, courseId: string): Promise<void> {
    const existing = await this.prisma.certification.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return;

    const [user, course] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
      this.prisma.course.findUnique({
        where: { id: courseId },
        select: {
          title: true,
          institutionId: true,
          institution: { select: { name: true } },
        },
      }),
    ]);

    if (!user || !course) return;

    // Persist the record first so the code is available for the PDF
    const cert = await this.prisma.certification.create({
      data: {
        userId,
        courseId,
        issuerId: course.institutionId ?? undefined,
      },
    });

    // Generate PDF and upload — failures do not roll back the cert record
    try {
      const pdfBuffer = await this.pdf.generate({
        userName: user.name,
        courseName: course.title,
        issuedAt: cert.issuedAt,
        code: cert.code,
        issuerName: course.institution?.name ?? 'Hanga Works',
        appUrl: process.env.APP_URL ?? 'http://localhost:3000',
      });

      const key = `certificates/${cert.id}.pdf`;
      const pdfUrl = await this.storage.uploadPdf(key, pdfBuffer);

      await this.prisma.certification.update({
        where: { id: cert.id },
        data: { pdfUrl },
      });
    } catch (err) {
      this.logger.warn(
        `PDF/upload failed for cert ${cert.id} — cert saved, pdfUrl is null. ${(err as Error).message}`,
      );
    }
  }

  // GET /certificates/verify/:token — public
  async verify(token: string) {
    const cert = await this.prisma.certification.findUnique({
      where: { code: token },
      include: {
        user: { select: { id: true, name: true } },
        course: { select: { id: true, title: true, slug: true } },
        issuer: { select: { id: true, name: true } },
      },
    });

    if (!cert) throw new NotFoundException('Certificate not found or invalid token');
    return cert;
  }

  // GET /certificates — learner's own certificates
  async getMyCertificates(userId: string) {
    return this.prisma.certification.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        issuer: { select: { id: true, name: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  // POST /certificates/validate — employer only
  async validate(token: string, userId: string, userRole: string) {
    if (userRole !== Role.EMPLOYER && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only employers can validate certificates');
    }
    return this.verify(token);
  }

  // Generate PDF on the fly for downloading
  async generatePdfFor(code: string): Promise<Buffer> {
    const cert = await this.verify(code);
    return this.pdf.generate({
      userName: cert.user.name,
      courseName: cert.course?.title ?? 'Course',
      issuedAt: cert.issuedAt,
      code: cert.code,
      issuerName: cert.issuer?.name ?? 'Hanga Works',
      appUrl: process.env.APP_URL ?? 'http://localhost:3000',
    });
  }
}
