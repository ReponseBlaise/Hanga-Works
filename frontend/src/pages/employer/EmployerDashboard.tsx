import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardMeta } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function EmployerDashboard() {
  const navigate = useNavigate();

  return (
    <section>
      <header className="page-header">
        <h2>Employer Dashboard</h2>
        <div>
          <Button to="/employer/post-job">Post Job</Button>
          <Button variant="secondary" to="/employer/applicants">View Applicants</Button>
        </div>
      </header>

      <div className="grid-columns">
        <Card>
          <CardTitle>Active Jobs</CardTitle>
          <CardMeta>3</CardMeta>
        </Card>
        <Card>
          <CardTitle>New Applicants</CardTitle>
          <CardMeta>5</CardMeta>
        </Card>
        <Card>
          <CardTitle>Hires</CardTitle>
          <CardMeta>1</CardMeta>
        </Card>
      </div>
    </section>
  );
}
