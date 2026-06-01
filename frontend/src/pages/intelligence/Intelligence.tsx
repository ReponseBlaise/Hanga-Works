import { useEffect, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { getJobs, type JobSummary } from '../../services/jobs.service';
import { getCareerPathway, getSkillGapAnalysis, type CareerPathway } from '../../services/intelligence.service';

function formatCount(value?: number) {
  return typeof value === 'number' ? value.toLocaleString() : '0';
}

export default function Intelligence() {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [gapAnalysis, setGapAnalysis] = useState<null | Awaited<ReturnType<typeof getSkillGapAnalysis>>>(null);
  const [pathway, setPathway] = useState<CareerPathway | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getJobs(), getCareerPathway()])
      .then(([jobsResponse, pathwayResponse]) => {
        if (!active) return;
        setJobs(jobsResponse.jobs ?? []);
        setPathway(pathwayResponse);
        setSelectedJobId((jobsResponse.jobs ?? [])[0]?.id ?? '');
      })
      .catch((fetchError) => {
        console.error('Failed to load intelligence data', fetchError);
        if (active) setError('The intelligence dashboard could not load right now.');
      })
      .finally(() => {
        if (active) setLoadingJobs(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedJobId) {
      setGapAnalysis(null);
      setLoadingAnalysis(false);
      return;
    }

    let active = true;
    setLoadingAnalysis(true);
    getSkillGapAnalysis(selectedJobId)
      .then((analysis) => {
        if (active) setGapAnalysis(analysis);
      })
      .catch((fetchError) => {
        console.error('Failed to load gap analysis', fetchError);
        if (active) setGapAnalysis(null);
      })
      .finally(() => {
        if (active) setLoadingAnalysis(false);
      });

    return () => {
      active = false;
    };
  }, [selectedJobId]);

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) ?? null, [jobs, selectedJobId]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SiteLayout>
      <section className="studio-dashboard">
        <header className="studio-hero">
          <div className="studio-hero__intro">
            <p className="eyebrow">Career intelligence</p>
            <h1 className="display-large">Match skills to live opportunities</h1>
            <p className="lead">This view is backed by the NestJS intelligence endpoints and the live jobs catalog.</p>
            <div className="studio-action-row mt-md">
              <Button to="/jobs" variant="secondary" className="button--lg">Browse jobs</Button>
              <Button to="/courses" variant="primary" className="button--lg button--pill">Browse courses</Button>
            </div>
          </div>
        </header>

        {error ? <Card className="studio-block"><CardTitle>{error}</CardTitle><CardMeta>Try refreshing the page or checking the backend API.</CardMeta></Card> : null}

        <section className="studio-layout">
          <main className="studio-column studio-column--main">
            <Card className="studio-block">
              <CardEyebrow>Skill gap</CardEyebrow>
              <CardTitle>Compare yourself to a live role</CardTitle>
              <CardMeta>Select a job to see matching and missing skills from the backend analysis.</CardMeta>
              
              <div className="form-stack mt-md">
                <label>
                  Target job
                  <select value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)}>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>{job.title} · {job.employer.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              {loadingAnalysis ? <p className="muted mt-md">Loading live gap analysis…</p> : null}
              {selectedJob && gapAnalysis && !loadingAnalysis ? (
                <div className="studio-metric-grid mt-md">
                  <div className="studio-metric">
                    <CardEyebrow>Match score</CardEyebrow>
                    <strong>{gapAnalysis.matchScore}%</strong>
                    <CardMeta>{selectedJob.title}</CardMeta>
                  </div>
                  <div className="studio-metric">
                    <CardEyebrow>Matching skills</CardEyebrow>
                    <strong>{formatCount(gapAnalysis.matchingSkills.length)}</strong>
                    <CardMeta>{gapAnalysis.matchingSkills.join(', ') || 'No overlaps yet.'}</CardMeta>
                  </div>
                  <div className="studio-metric">
                    <CardEyebrow>Missing skills</CardEyebrow>
                    <strong>{formatCount(gapAnalysis.missingSkills.length)}</strong>
                    <CardMeta>{gapAnalysis.missingSkills.join(', ') || 'Nothing missing.'}</CardMeta>
                  </div>
                </div>
              ) : null}
            </Card>

            <section className="studio-section mt-lg">
              <div className="studio-section__head">
                <div>
                  <p className="eyebrow">Recommended courses</p>
                  <h2>Training that closes the gap</h2>
                </div>
              </div>
              <div className="studio-job-grid">
                {(pathway?.recommendedCourses ?? []).map((course) => (
                  <Card key={course.id} className="studio-job-card">
                    <div className="studio-job-card__head">
                      <div>
                        <CardEyebrow>{course.institution?.name ?? 'Hanga Works'}</CardEyebrow>
                        <CardTitle><Link to={`/courses/${course.id}`}>{course.title}</Link></CardTitle>
                      </div>
                      <span className="dashboard-chip">{course._count?.modules ?? course.modules?.length ?? 0} modules</span>
                    </div>
                    <CardMeta>{course.description}</CardMeta>
                    <div className="studio-action-row mt-md">
                      <Button to={`/courses/${course.id}`} variant="secondary">Open course</Button>
                    </div>
                  </Card>
                ))}
                {!loadingJobs && !(pathway?.recommendedCourses?.length ?? 0) ? (
                  <Card className="studio-block">
                    <CardTitle>No recommendations yet</CardTitle>
                    <CardMeta>As you add skills and apply to jobs, the pathway view will become more specific.</CardMeta>
                  </Card>
                ) : null}
              </div>
            </section>
          </main>

          <aside className="studio-column studio-column--right">
            <Card className="studio-block">
              <CardEyebrow>Pathway</CardEyebrow>
              <CardTitle>Recommended next step</CardTitle>
              <CardMeta>
                {pathway?.currentLevel ?? 'Loading level'} → {pathway?.nextMilestone ?? 'Loading milestone'}
              </CardMeta>
              <div className="studio-stack mt-md">
                {(pathway?.trendingSkillsToLearn ?? []).slice(0, 5).map((skill) => (
                  <div key={skill.skillId} className="studio-inline-item">
                    <div>
                      <strong>Skill {skill.skillId.slice(0, 8)}</strong>
                    </div>
                    <span>{skill._count?.skillId ?? 0}</span>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </section>
      </section>
    </SiteLayout>
  );
}
