import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';

export default function AdminExportPage() {
  return (
    <SiteLayout>
      <div className="page-shell">
        <Card>
          <CardTitle>Export CSV</CardTitle>
          <CardMeta>Admin export workflow placeholder. Connect this page to the reporting export API when available.</CardMeta>
        </Card>
      </div>
    </SiteLayout>
  );
}
