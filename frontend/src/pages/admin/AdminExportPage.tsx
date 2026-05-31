import { useEffect, useState } from 'react';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getAnalyticsOverview, exportAnalyticsCsv, type AnalyticsOverview } from '../../services/analytics.service';

export default function AdminExportPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    getAnalyticsOverview()
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch((error) => {
        console.error('Failed to load analytics overview', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleExport() {
    setExporting(true);
    setMessage('Preparing CSV export from the analytics endpoint.');
    try {
      const csvBlob = await exportAnalyticsCsv();
      const url = window.URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage('CSV export downloaded successfully.');
    } catch (error) {
      console.error('Failed to export analytics CSV', error);
      setMessage('Analytics export could not be generated right now.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <SiteLayout>
      <div className="page-shell">
        <header className="page-head">
          <div>
            <h1>Export analytics</h1>
            <p className="muted">Download admin reporting data from the backend and review platform-level usage.</p>
          </div>
          <Button type="button" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Download CSV'}
          </Button>
        </header>

        <div className="grid-columns">
          <Card>
            <CardTitle>Total users</CardTitle>
            <CardMeta>{loading ? 'Loading…' : overview?.totalUsers ?? 0}</CardMeta>
          </Card>
          <Card>
            <CardTitle>Active jobs</CardTitle>
            <CardMeta>{loading ? 'Loading…' : overview?.activeJobs ?? 0}</CardMeta>
          </Card>
          <Card>
            <CardTitle>Completion rate</CardTitle>
            <CardMeta>{loading ? 'Loading…' : overview?.completionRate ?? '0%'}</CardMeta>
          </Card>
        </div>

        {message ? <Card><CardMeta>{message}</CardMeta></Card> : null}
      </div>
    </SiteLayout>
  );
}
