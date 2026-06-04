import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CertificationsService } from '../certifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfService } from '../pdf.service';
import { StorageService } from '../../storage/storage.service';

// ── fixtures ──────────────────────────────────────────────────────────────
const USER_ID   = 'user-uuid-1';
const COURSE_ID = 'course-uuid-1';
const CERT_ID   = 'cert-uuid-1';
const CERT_CODE = 'verify-token-abc';
const EMPLOYER_ID = 'employer-uuid-1';

const mockCert = {
  id: CERT_ID,
  code: CERT_CODE,
  userId: USER_ID,
  courseId: COURSE_ID,
  issuerId: null,
  pdfUrl: 'https://cdn.example.com/certificates/cert-uuid-1.pdf',
  issuedAt: new Date(),
  expiresAt: null,
  user: { id: USER_ID, name: 'Alice' },
  course: { id: COURSE_ID, title: 'Node.js Fundamentals', slug: 'nodejs-fundamentals' },
  issuer: null,
};

const mockPrisma = {
  certification: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  user: { findUnique: jest.fn() },
  course: { findUnique: jest.fn() },
};

const mockPdf: Partial<PdfService> = {
  generate: jest.fn().mockResolvedValue(Buffer.from('pdf-content')),
};

const mockStorage: Partial<StorageService> = {
  uploadPdf: jest.fn().mockResolvedValue('https://cdn.example.com/certificates/cert-uuid-1.pdf'),
};

describe('CertificationsService', () => {
  let service: CertificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PdfService, useValue: mockPdf },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();

    service = module.get<CertificationsService>(CertificationsService);
    jest.clearAllMocks();
  });

  // ── issue ────────────────────────────────────────────────────────────────
  describe('issue', () => {
    it('creates cert, generates PDF and uploads it', async () => {
      mockPrisma.certification.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({ name: 'Alice' });
      mockPrisma.course.findUnique.mockResolvedValue({
        title: 'Node.js Fundamentals',
        institutionId: null,
        institution: null,
      });
      mockPrisma.certification.create.mockResolvedValue({
        id: CERT_ID,
        code: CERT_CODE,
        issuedAt: new Date(),
      });
      mockPrisma.certification.update.mockResolvedValue(mockCert);

      await service.issue(USER_ID, COURSE_ID);

      expect(mockPrisma.certification.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: USER_ID, courseId: COURSE_ID }) }),
      );
      expect(mockPdf.generate).toHaveBeenCalled();
      expect(mockStorage.uploadPdf).toHaveBeenCalledWith(
        `certificates/${CERT_ID}.pdf`,
        expect.any(Buffer),
      );
      expect(mockPrisma.certification.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { pdfUrl: expect.any(String) } }),
      );
    });

    it('is idempotent — skips if cert already exists', async () => {
      mockPrisma.certification.findUnique.mockResolvedValue(mockCert);

      await service.issue(USER_ID, COURSE_ID);

      expect(mockPrisma.certification.create).not.toHaveBeenCalled();
      expect(mockPdf.generate).not.toHaveBeenCalled();
    });

    it('silently skips if user or course not found', async () => {
      mockPrisma.certification.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.course.findUnique.mockResolvedValue(null);

      await expect(service.issue(USER_ID, COURSE_ID)).resolves.toBeUndefined();
      expect(mockPrisma.certification.create).not.toHaveBeenCalled();
    });

    it('saves cert even when PDF upload fails', async () => {
      mockPrisma.certification.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({ name: 'Alice' });
      mockPrisma.course.findUnique.mockResolvedValue({
        title: 'Node.js Fundamentals',
        institutionId: null,
        institution: null,
      });
      mockPrisma.certification.create.mockResolvedValue({
        id: CERT_ID,
        code: CERT_CODE,
        issuedAt: new Date(),
      });
      (mockStorage.uploadPdf as jest.Mock).mockRejectedValue(new Error('S3 unavailable'));

      await expect(service.issue(USER_ID, COURSE_ID)).resolves.toBeUndefined();
      expect(mockPrisma.certification.create).toHaveBeenCalled();
      // update not called because upload failed
      expect(mockPrisma.certification.update).not.toHaveBeenCalled();
    });
  });

  // ── verify ───────────────────────────────────────────────────────────────
  describe('verify', () => {
    it('returns cert by verification token', async () => {
      mockPrisma.certification.findUnique.mockResolvedValue(mockCert);

      const result = await service.verify(CERT_CODE);

      expect(mockPrisma.certification.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { code: CERT_CODE } }),
      );
      expect(result.code).toBe(CERT_CODE);
    });

    it('throws NotFoundException for unknown token', async () => {
      mockPrisma.certification.findUnique.mockResolvedValue(null);

      await expect(service.verify('bad-token')).rejects.toThrow(NotFoundException);
    });
  });

  // ── validate ─────────────────────────────────────────────────────────────
  describe('validate', () => {
    it('returns cert when called by EMPLOYER', async () => {
      mockPrisma.certification.findUnique.mockResolvedValue(mockCert);

      const result = await service.validate(CERT_CODE, EMPLOYER_ID, Role.EMPLOYER);

      expect(result.code).toBe(CERT_CODE);
    });

    it('throws ForbiddenException when called by LEARNER', async () => {
      await expect(
        service.validate(CERT_CODE, USER_ID, Role.LEARNER),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.certification.findUnique).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when token is invalid (even for EMPLOYER)', async () => {
      mockPrisma.certification.findUnique.mockResolvedValue(null);

      await expect(
        service.validate('bad-token', EMPLOYER_ID, Role.EMPLOYER),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
