import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface CertificateData {
  userName: string;
  courseName: string;
  issuedAt: Date;
  code: string;
  issuerName: string;
  appUrl: string;
}

@Injectable()
export class PdfService {
  generate(data: CertificateData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 60 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke('#c8a84b');

      // Header
      doc
        .fontSize(38)
        .fillColor('#1a1a2e')
        .text('Certificate of Completion', { align: 'center' });

      doc.moveDown(0.5);
      doc
        .fontSize(14)
        .fillColor('#555')
        .text('This is to certify that', { align: 'center' });

      // Learner name
      doc.moveDown(0.5);
      doc
        .fontSize(32)
        .fillColor('#c8a84b')
        .text(data.userName, { align: 'center' });

      doc.moveDown(0.5);
      doc
        .fontSize(14)
        .fillColor('#555')
        .text('has successfully completed the course', { align: 'center' });

      // Course name
      doc.moveDown(0.5);
      doc
        .fontSize(22)
        .fillColor('#1a1a2e')
        .text(data.courseName, { align: 'center' });

      // Issuer + date
      doc.moveDown(1.5);
      const dateStr = data.issuedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc
        .fontSize(12)
        .fillColor('#555')
        .text(`Issued by: ${data.issuerName}   |   Date: ${dateStr}`, { align: 'center' });

      // Verification footer
      doc.moveDown(1);
      doc
        .fontSize(10)
        .fillColor('#888')
        .text(`Verification code: ${data.code}`, { align: 'center' });
      doc.text(`Verify at: ${data.appUrl}/api/certificates/verify/${data.code}`, {
        align: 'center',
      });

      doc.end();
    });
  }
}
