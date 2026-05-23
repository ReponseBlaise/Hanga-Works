import { useEffect, useMemo, useState } from 'react';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [active, setActive] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let activeFetch = true;

    getEmployerJobs()
      .then((allJobs) => {
        if (!activeFetch) return;
        const ownJobs = user?.organizationId
          ? allJobs.filter((job) => job.employer.id === user.organizationId)
          : allJobs;
        setJobs(ownJobs);
        setSelectedJobId((current) => current || ownJobs[0]?.id || '');
      })
      .catch((error) => {
        console.error('Failed to load jobs', error);
      });

    return () => {
      activeFetch = false;
    };
  }, [user?.organizationId]);

  useEffect(() => {
    if (!selectedJobId) {
      setCandidates([]);
      return;
    }

    setLoading(true);
    getApplicantsForJob(selectedJobId)
      .then((applications) => {
        const mapped = applications.map(mapApplicantToCandidate);
        setCandidates(mapped);
      })
      .catch((error) => {
        console.error('Failed to load applicants', error);
        setCandidates([]);
      })
      .finally(() => setLoading(false));
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
        setCandidates((prev) => prev.map((c) => (c.id === id ? mapApplicantToCandidate(updated) : c)));
      })
      .catch((error) => {
        console.error('Failed to update application stage', error);
      });
  }

  return (
    <section>
      <header className="page-header">
        <h2>Applicants</h2>
        <div>
          <Button to="/employer/post-job">Post Job</Button>
          <Button variant="secondary" onClick={() => navigate('/employer')}>Overview</Button>
        </div>
      </header>

      <div className="form-stack" style={{ marginBottom: 16 }}>
        <label>
          Job
          <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
            {jobs.length === 0 ? (
              <option value="">No jobs available</option>
            ) : jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? <p>Loading applicants…</p> : null}
      <div className="kanban">
        {pipelineStages.map((stage) => (
          <div className="kanban-column" key={stage}>
            <h3 className="kanban-title">{stageLabels[stage]}</h3>
            <div className="kanban-list">
              {grouped[stage].map((c) => (
                <article key={c.id} className="kanban-card" onClick={() => setActive(c)}>
                  <Card>
                    <CardTitle>{c.name}</CardTitle>
                    <CardMeta>{c.email}</CardMeta>
                    {c.jobTitle ? <CardMeta>{c.jobTitle}</CardMeta> : null}
                  </Card>
                </article>
              ))}
            </div>
            <div className="kanban-actions">
              {stage !== 'HIRED' && stage !== 'REJECTED' && (
                <Button variant="ghost" onClick={() => {
                  const nextIndex = pipelineStages.indexOf(stage) + 1;
                  const next = pipelineStages[nextIndex];
                  grouped[stage].forEach((c) => moveCandidate(c.id, next));
                }}>Move all →</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.name} variant="drawer" actions={
        <div style={{ display: 'flex', gap: 8 }}>
          {active && active.stage !== 'HIRED' && active.stage !== 'REJECTED' && (
            <Button onClick={() => moveCandidate(active.id, pipelineStages[pipelineStages.indexOf(active.stage) + 1])}>Move to next</Button>
          )}
          <Button variant="secondary" onClick={() => setActive(null)}>Close</Button>
        </div>
      }>
        {active ? (
          <div>
            <p><strong>Email:</strong> {active.email}</p>
            <p><strong>Stage:</strong> {stageLabels[active.stage]}</p>
            {active.jobTitle ? <p><strong>Job:</strong> {active.jobTitle}</p> : null}
            <p>{active.summary}</p>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

function mapApplicantToCandidate(application: EmployerApplicant): Candidate {
  return {
    id: application.id,
    name: application.user.name,
    email: application.user.email,
    stage: application.status,
    summary: `Applied on ${new Date(application.appliedAt).toLocaleDateString()}`,
    jobTitle: application.job.title,
  };
}
