import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';

export default function AdminModerationPage() {
  return (
    <DashboardLayout>
      <div className="page-shell">
        <Card>
          <CardTitle>Moderation Queue</CardTitle>
          <CardMeta>Content moderation placeholder for admin review and approvals.</CardMeta>
        </Card>
      </div>
    </DashboardLayout>
  );
}
