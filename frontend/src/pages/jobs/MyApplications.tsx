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
			<section className="applications-page">
				<header className="job-market-hero card">
					<div>
						<p className="section-head__eyebrow">Applications</p>
						<h2>Track where every application stands</h2>
						<p className="card-meta">Review your pipeline from applied to hired, with direct links back to each job description.</p>
					</div>
					<div className="job-market-hero__stats">
						<div className="hero-stat">
							<span>Total applications</span>
							<strong>{applications.length}</strong>
							<p>Loaded from the backend.</p>
						</div>
					</div>
				</header>

				{loading ? <p>Loading applications…</p> : null}

				<div className="kanban">
					{stages.map((stage) => (
						<div className="kanban-column" key={stage}>
							<h3 className="kanban-title">{stageLabels[stage]}</h3>
							<div className="kanban-list">
								{grouped[stage].length === 0 ? <Card className="kanban-card"><CardMeta>No applications in this stage.</CardMeta></Card> : null}
								{grouped[stage].map((application) => (
									<Card key={application.id} className="kanban-card">
										<CardEyebrow>{application.job.employer.name}</CardEyebrow>
										<CardTitle><Link to={`/jobs/${application.job.id}`}>{application.job.title}</Link></CardTitle>
										<CardMeta>{application.job.location ?? 'Remote friendly'}</CardMeta>
										<CardMeta>Updated {new Date(application.updatedAt).toLocaleDateString()}</CardMeta>
										<div className="job-card__actions">
											<Button to={`/jobs/${application.job.id}`} variant="secondary">View job</Button>
										</div>
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
