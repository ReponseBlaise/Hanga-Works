import { useEffect, useMemo, useState } from 'react';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getEmployerJobs, getApplicantsForJob, updateApplicationStage, type EmployerApplicant } from '../../services/employer.service';

type Candidate = {
  id: string;
  name: string;
  email: string;
  stage: 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'HIRED' | 'REJECTED';
  summary?: string;
  jobTitle?: string;
};

const pipelineStages: Candidate['stage'][] = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'];

const stageLabels: Record<Candidate['stage'], string> = {
  APPLIED: 'Applied',
  REVIEWING: 'Reviewing',
  SHORTLISTED: 'Shortlisted',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
};

export default function Applicants() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Array<{ id: string; title: string; employer: { id: string } }>>([]);
  const { id } = useParams<{ id: string }>();
  const [selectedJobId, setSelectedJobId] = useState(id || '');
  const [rawCandidates, setRawCandidates] = useState<Candidate[]>([]);
  const [active, setActive] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const candidates = useMemo(
    () => (selectedJobId ? rawCandidates : []),
    [selectedJobId, rawCandidates],
  );

  useEffect(() => {
    let activeFetch = true;

    getEmployerJobs()
      .then((allJobs) => {
        if (!activeFetch) return;
        const ownJobs = user?.organizationId
          ? allJobs.filter((job) => job.employer.id === user.organizationId)
          : allJobs;
        setJobs(ownJobs);
        if (!id) {
          setSelectedJobId((current) => current || ownJobs[0]?.id || '');
        }
      })
      .catch((error) => {
        console.error('Failed to load jobs', error);
      });

    return () => {
      activeFetch = false;
    };
  }, [user?.organizationId]);

  useEffect(() => {
    if (!selectedJobId) return;

    let active = true;
    void (async () => {
      setLoading(true);
      try {
        const applications = await getApplicantsForJob(selectedJobId);
        if (active) setRawCandidates(applications.map(mapApplicantToCandidate));
      } catch (error) {
        console.error('Failed to load applicants', error);
        if (active) setRawCandidates([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selectedJobId]);

  const grouped = useMemo(() => {
    const map: Record<string, Candidate[]> = {};
    pipelineStages.forEach((s) => (map[s] = []));
    candidates.forEach((c) => map[c.stage].push(c));
    return map as Record<Candidate['stage'], Candidate[]>;
  }, [candidates]);

  function moveCandidate(id: string, to: Candidate['stage']) {
    updateApplicationStage(id, to)
      .then((updated) => {
        setRawCandidates((prev) => prev.map((c) => (c.id === id ? mapApplicantToCandidate(updated) : c)));
      })
      .catch((error) => {
        console.error('Failed to update application stage', error);
      });
  }

  return (
    <SiteLayout>
      <section className="studio-applicants studio-applicants--employer employer-page">
        <header className="studio-applicants__head employer-page__head">
          <div>
            <p className="eyebrow">Applicant review</p>
            <h1 className="display">Review candidates by stage</h1>
            <p className="lead">Choose a job posting, then move applicants through Applied, Reviewing, Shortlisted, Hired, or Rejected.</p>
          </div>
          <div className="studio-action-row">
            <Button to="/employer/post-job" variant="primary">Post job</Button>
            <Button variant="secondary" onClick={() => navigate('/employer')}>Back to dashboard</Button>
          </div>
        </header>

        <Card className="studio-block employer-form-card">
          <label className="employer-form__label">
            <span className="employer-form__label-row">Job posting</span>
            <select
              className="employer-form__select"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              {jobs.length === 0 ? <option value="">No jobs available</option> : jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
            </select>
          </label>
        </Card>

        {loading ? <p>Loading applicants...</p> : null}

        <div className="studio-applicants__kanban">
          {pipelineStages.map((stage) => (
            <Card className="studio-block" key={stage}>
              <h3 className="kanban-title">{stageLabels[stage]}</h3>
              <div className="kanban-list">
                {grouped[stage].length === 0 ? <CardMeta>No applicants in this stage.</CardMeta> : null}
                {grouped[stage].map((candidate) => (
                  <button key={candidate.id} type="button" className="studio-candidate-card" onClick={() => setActive(candidate)}>
                    <strong>{candidate.name}</strong>
                    <span>{candidate.email}</span>
                    {candidate.jobTitle ? <span>{candidate.jobTitle}</span> : null}
                  </button>
                ))}
              </div>
              {stage !== 'HIRED' && stage !== 'REJECTED' ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    const nextIndex = pipelineStages.indexOf(stage) + 1;
                    const next = pipelineStages[nextIndex];
                    grouped[stage].forEach((candidate) => moveCandidate(candidate.id, next));
                  }}
                >
                  Move all to next stage
                </Button>
              ) : null}
            </Card>
          ))}
        </div>

        <Modal
          open={!!active}
          onClose={() => setActive(null)}
          title={active?.name}
          variant="drawer"
          actions={
            <div className="studio-action-row">
              {active && active.stage !== 'HIRED' && active.stage !== 'REJECTED' ? (
                <Button onClick={() => moveCandidate(active.id, pipelineStages[pipelineStages.indexOf(active.stage) + 1])}>Move to next stage</Button>
              ) : null}
              <Button variant="secondary" onClick={() => setActive(null)}>Close</Button>
            </div>
          }
        >
          {active ? (
            <div className="studio-applicant-review">
              <Card className="studio-block">
                <CardTitle>Applicant profile</CardTitle>
                <p><strong>Email:</strong> {active.email}</p>
                <p><strong>Current stage:</strong> {stageLabels[active.stage]}</p>
                {active.jobTitle ? <p><strong>Job:</strong> {active.jobTitle}</p> : null}
                <p>{active.summary}</p>
              </Card>

              <Card className="studio-block">
                <CardTitle>Resume preview</CardTitle>
                <div className="studio-resume-preview">
                  <h4>{active.name}</h4>
                  <p>{active.email}</p>
                  <p>{active.summary}</p>
                  <p>This placeholder panel is where uploaded resume content can be rendered.</p>
                </div>
              </Card>

              <Card className="studio-block">
                <CardTitle>Rating and comments</CardTitle>
                <div className="form-stack">
                  <label>
                    Recruiter rating (1-5)
                    <select
                      value={ratings[active.id] ?? 3}
                      onChange={(event) => setRatings((prev) => ({ ...prev, [active.id]: Number(event.target.value) }))}
                    >
                      {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  <label>
                    Internal comments
                    <textarea
                      rows={5}
                      value={comments[active.id] ?? ''}
                      onChange={(event) => setComments((prev) => ({ ...prev, [active.id]: event.target.value }))}
                      placeholder="Capture interviewer notes, strengths, and risks"
                    />
                  </label>
                </div>
              </Card>
            </div>
          ) : null}
        </Modal>
      </section>
    </SiteLayout>
  );
}

function mapApplicantToCandidate(application: EmployerApplicant): Candidate {
  const jobTitle = application.job?.title ?? 'Job details unavailable';
  return {
    id: application.id,
    name: application.user.name,
    email: application.user.email,
    stage: application.status,
    summary: `Applied on ${new Date(application.appliedAt).toLocaleDateString()}`,
    jobTitle,
  };
}
