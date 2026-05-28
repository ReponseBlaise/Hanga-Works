import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';

export default function AdminModerationPage() {
  return (
    <SiteLayout>
      <div className="page-shell">
        <Card>
          <CardTitle>Moderation Queue</CardTitle>
          <CardMeta>Content moderation placeholder for admin review and approvals.</CardMeta>
        </Card>
      </div>
    </SiteLayout>
  );
}
