import { useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <DashboardLayout>
      <div className="page-shell">
        <Card>
          <CardTitle>User Details</CardTitle>
          <CardMeta>User ID: {id}</CardMeta>
          <CardMeta>Detailed admin profile view placeholder.</CardMeta>
        </Card>
      </div>
    </DashboardLayout>
  );
}
