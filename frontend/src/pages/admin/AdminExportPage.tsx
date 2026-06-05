import { useState } from 'react';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Card, CardMeta } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { getCourses } from '../../services/courses.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminExportPage() {
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');

  async function fetchExportData(type: 'users' | 'courses') {
    if (type === 'users') {
      const res = await api.get('/users').catch(() => ({ data: { data: [] } }));
      const users = res.data?.data ?? res.data ?? [];
      return Array.isArray(users) ? users : [];
    } else {
      const courses = await getCourses().catch(() => []);
      return courses.map(c => ({
        id: c.id,
        title: c.title,
        institution: c.institution?.name ?? 'Unknown',
        published: c.published ? 'Yes' : 'No',
        enrollments: c._count?.enrollments ?? 0,
      }));
    }
  }

  function handleCsvExport(data: any[], filename: string) {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${String(row[header] ?? '')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleExcelExport(data: any[], filename: string) {
    if (data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  function handlePdfExport(data: any[], filename: string, title: string) {
    if (data.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    const headers = Object.keys(data[0]);
    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: data.map(row => headers.map(header => String(row[header] ?? ''))),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] }
    });
    doc.save(`${filename}.pdf`);
  }

  async function exportData(dataType: 'users' | 'courses', format: 'csv' | 'excel' | 'pdf') {
    setExporting(true);
    setMessage(`Preparing ${format.toUpperCase()} export for ${dataType}...`);
    try {
      const data = await fetchExportData(dataType);
      if (data.length === 0) {
        setMessage(`No ${dataType} data available to export.`);
        return;
      }
      const filename = `hanga-works-${dataType}-${new Date().toISOString().slice(0, 10)}`;
      if (format === 'csv') handleCsvExport(data, filename);
      if (format === 'excel') handleExcelExport(data, filename);
      if (format === 'pdf') handlePdfExport(data, filename, `Hanga Works - ${dataType.toUpperCase()} Export`);
      setMessage(`${format.toUpperCase()} export downloaded successfully.`);
    } catch (error) {
      console.error('Export failed:', error);
      setMessage('Export failed due to a system error.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <AdminSidebar />

        <div className="studio-dashboard dashboard-redesign">
          <header className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Data export</p>
              <h1 className="display">Download platform data</h1>
              <p className="lead">Export users and courses in CSV, Excel, or PDF formats for offline reporting and compliance.</p>
            </div>
          </header>

          <section aria-label="Data export options" style={{ display: 'grid', gap: '16px' }}>
            {message && (
              <div role="status" aria-live="polite" style={{ padding: '14px 16px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <strong>Status:</strong> {message}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
              <Card className="studio-block">
                <div className="studio-section__head">
                  <div>
                    <p className="eyebrow">Users Database</p>
                    <h2>Export all users</h2>
                  </div>
                </div>
                <CardMeta>Includes ID, name, email, role, and creation dates.</CardMeta>
                <div className="studio-action-row mt-md" role="group" aria-label="Export users format">
                  <Button type="button" onClick={() => exportData('users', 'csv')} disabled={exporting} aria-label="Export users as CSV">CSV</Button>
                  <Button type="button" onClick={() => exportData('users', 'excel')} disabled={exporting} aria-label="Export users as Excel">Excel</Button>
                  <Button type="button" onClick={() => exportData('users', 'pdf')} disabled={exporting} variant="primary" aria-label="Export users as PDF">PDF</Button>
                </div>
              </Card>

              <Card className="studio-block">
                <div className="studio-section__head">
                  <div>
                    <p className="eyebrow">Course Catalog</p>
                    <h2>Export all courses</h2>
                  </div>
                </div>
                <CardMeta>Includes course details, institution, publish status, and enrollment counts.</CardMeta>
                <div className="studio-action-row mt-md" role="group" aria-label="Export courses format">
                  <Button type="button" onClick={() => exportData('courses', 'csv')} disabled={exporting} aria-label="Export courses as CSV">CSV</Button>
                  <Button type="button" onClick={() => exportData('courses', 'excel')} disabled={exporting} aria-label="Export courses as Excel">Excel</Button>
                  <Button type="button" onClick={() => exportData('courses', 'pdf')} disabled={exporting} variant="primary" aria-label="Export courses as PDF">PDF</Button>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
