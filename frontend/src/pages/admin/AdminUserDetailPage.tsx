import { useParams } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <SiteLayout>
      <div className="page-shell">
        <Card>
          <CardTitle>User Details</CardTitle>
          <CardMeta>User ID: {id}</CardMeta>
          <CardMeta>Detailed admin profile view placeholder.</CardMeta>
        </Card>
      </div>
    </SiteLayout>
  );
}
