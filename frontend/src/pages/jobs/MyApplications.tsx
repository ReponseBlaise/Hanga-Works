import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { getApplications } from '../../services/jobs.service';
import type { JobApplication, JobApplicationStage } from '../../types/job.types';

const stageLabels: Record<JobApplicationStage, string> = {
	APPLIED: 'Applied',
	REVIEWING: 'Reviewing',
	SHORTLISTED: 'Shortlisted',
	HIRED: 'Hired',
	REJECTED: 'Rejected',
};

const stages: JobApplicationStage[] = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'];

export default function MyApplications() {
	const { isAuthenticated } = useAuth();
	const [applications, setApplications] = useState<JobApplication[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!isAuthenticated) {
			setApplications([]);
			setLoading(false);
			return;
		}

		let active = true;
		getApplications()
			.then((items) => {
				if (active) setApplications(items ?? []);
			})
			.catch((error) => {
				console.error('Failed to load applications', error);
				if (active) setApplications([]);
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
		};
	}, [isAuthenticated]);

	const grouped = useMemo(() => {
		return stages.reduce<Record<JobApplicationStage, JobApplication[]>>((acc, stage) => {
			acc[stage] = applications.filter((item) => item.status === stage);
			return acc;
		}, {} as Record<JobApplicationStage, JobApplication[]>);
	}, [applications]);

	return (
		<SiteLayout>
			<section className="dashboard-page">
				<section className="dashboard-hero card card--hero">
					<div className="dashboard-hero__copy">
						<p className="eyebrow">Applications</p>
						<h1 className="display-large">Track every application from applied to hired.</h1>
						<p className="dashboard-hero__lead">Review your pipeline with direct links back to each job posting and a clear stage-by-stage view of every application.</p>
						<div className="dashboard-hero__actions">
							<Button to="/jobs" variant="primary" className="button--lg button--pill">Search jobs</Button>
							<Button to="/profile" variant="secondary" className="button--lg">Update profile</Button>
						</div>
					</div>
					<div className="dashboard-hero__visual">
						<div className="dashboard-summary__grid">
							<div className="dashboard-summary__stat"><span>Total applications</span><strong>{applications.length}</strong></div>
							<div className="dashboard-summary__stat"><span>In review</span><strong>{grouped.REVIEWING.length + grouped.SHORTLISTED.length}</strong></div>
							<div className="dashboard-summary__stat"><span>Pipeline stages</span><strong>{stages.length}</strong></div>
						</div>
						<Card className="dashboard-panel"><CardEyebrow>Live status</CardEyebrow><CardTitle>Your application pipeline</CardTitle><CardMeta>Move through the stages below without losing context.</CardMeta></Card>
					</div>
				</section>

				{loading ? <p>Loading applications…</p> : null}

				<div className="kanban">
					{stages.map((stage) => (
						<div className="kanban-column" key={stage}>
							<div className="dashboard-section__head"><div><p className="eyebrow">{stageLabels[stage]}</p><h2>{grouped[stage].length} items</h2></div></div>
							<div className="kanban-list">
								{grouped[stage].length === 0 ? <Card className="kanban-card"><CardMeta>No applications in this stage.</CardMeta></Card> : null}
								{grouped[stage].map((application) => (
									<Card key={application.id} className="kanban-card">
										<CardEyebrow>{application.job.employer.name}</CardEyebrow>
										<CardTitle><Link to={`/jobs/${application.job.id}`}>{application.job.title}</Link></CardTitle>
										<CardMeta>{application.job.location ?? 'Remote friendly'}</CardMeta>
										<CardMeta>Updated {new Date(application.updatedAt).toLocaleDateString()}</CardMeta>
										<div className="dashboard-card__actions"><Button to={`/jobs/${application.job.id}`} variant="secondary">View job</Button></div>
									</Card>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
		</SiteLayout>
	);
}
