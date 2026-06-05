import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { getCareerModel, type CareerModel } from '../../services/intelligence.service';

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--success, #22c55e)' : score >= 40 ? 'var(--warning, #f59e0b)' : 'var(--danger, #ef4444)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', border: `6px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <strong style={{ fontSize: '1.6rem', color }}>{score}%</strong>
      </div>
      <CardMeta>{score >= 70 ? 'Strong market fit' : score >= 40 ? 'Moderate fit' : 'Low fit — consider upskilling'}</CardMeta>
    </div>
  );
}

export default function CareerModelling() {
  const [model, setModel] = useState<CareerModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getCareerModel()
      .then((data) => { if (active) setModel(data); })
      .catch(() => { if (active) setError('Could not load career model. Make sure you have skills on your profile.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <SiteLayout>
      <section className="studio-dashboard">
        <header className="studio-hero">
          <div className="studio-hero__intro">
            <p className="eyebrow">Career intelligence</p>
            <h1 className="display-large">Career modelling</h1>
            <p className="lead">Your role viability score, skills at risk of deprecation, and pivot pathways based on live job demand.</p>
            <div className="studio-action-row mt-md">
              <Button to="/intelligence" variant="secondary">Back to intelligence</Button>
              <Button to="/profile" variant="primary">Update skills</Button>
            </div>
          </div>
        </header>

        {error && (
          <Card className="studio-block mt-lg">
            <CardTitle>Unable to load career model</CardTitle>
            <CardMeta>{error}</CardMeta>
            <div className="studio-action-row mt-md">
              <Button to="/profile" variant="primary">Add skills to your profile</Button>
            </div>
          </Card>
        )}

        {loading && !error && (
          <Card className="studio-block mt-lg"><CardTitle>Analysing your career profile…</CardTitle></Card>
        )}

        {!loading && !error && model && (
          <section className="dashboard-layout dashboard-layout--two-col-right mt-lg">
            <main className="dashboard-main-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Deprecation alerts */}
              <Card className="studio-block">
                <CardEyebrow>Skill health</CardEyebrow>
                <CardTitle>Deprecation alerts</CardTitle>
                <CardMeta>Skills on your profile with low demand in the current job market.</CardMeta>
                {model.deprecatedSkills.length === 0 ? (
                  <p className="muted mt-md">All your skills have healthy demand. Keep it up!</p>
                ) : (
                  <div className="dashboard-list mt-md">
                    {model.deprecatedSkills.map((s) => (
                      <div key={s.skillId} className="dashboard-list__item">
                        <div>
                          <strong>{s.name}</strong>
                          <div className="dashboard-list__meta">
                            Only {s.jobCount} active {s.jobCount === 1 ? 'job requires' : 'jobs require'} this skill
                          </div>
                        </div>
                        <span className="dashboard-chip" style={{ background: 'var(--danger-soft, #fee2e2)', color: 'var(--danger, #ef4444)' }}>
                          At risk
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Pivot pathways */}
              <Card className="studio-block">
                <CardEyebrow>Career pivots</CardEyebrow>
                <CardTitle>Roles you could transition into</CardTitle>
                <CardMeta>Live jobs where your existing skills are partially a match.</CardMeta>
                {model.pivotPathways.length === 0 ? (
                  <p className="muted mt-md">No pivot suggestions yet. Add more skills to your profile to unlock this section.</p>
                ) : (
                  <div className="dashboard-list mt-md">
                    {model.pivotPathways.map((pivot) => (
                      <div key={pivot.id} className="dashboard-list__item">
                        <div>
                          <strong><Link to={`/jobs/${pivot.id}`}>{pivot.title}</Link></strong>
                          <div className="dashboard-list__meta">{pivot.employer}</div>
                          {pivot.missingSkills.length > 0 && (
                            <div className="studio-chip-row" style={{ marginTop: 6 }}>
                              {pivot.missingSkills.map((skill) => (
                                <span key={skill} className="dashboard-chip" style={{ fontSize: '0.75rem' }}>
                                  Missing: {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <strong style={{ color: pivot.matchPct >= 60 ? 'var(--success, #22c55e)' : 'var(--warning, #f59e0b)' }}>
                            {pivot.matchPct}% match
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Upgrade courses */}
              {model.upgradeCourses.length > 0 && (
                <Card className="studio-block">
                  <CardEyebrow>Recommended training</CardEyebrow>
                  <CardTitle>Courses to close the gap</CardTitle>
                  <div className="studio-job-grid mt-md">
                    {model.upgradeCourses.map((course) => (
                      <Card key={course.id} className="studio-job-card">
                        <CardEyebrow>{course.institution?.name ?? 'Hanga Works'}</CardEyebrow>
                        <CardTitle><Link to={`/courses/${course.id}`}>{course.title}</Link></CardTitle>
                        <div className="studio-action-row mt-md">
                          <Button to={`/courses/${course.id}`} variant="secondary">Open course</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}
            </main>

            <aside className="dashboard-rail dashboard-rail--right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Viability score */}
              <Card className="studio-block" style={{ textAlign: 'center' }}>
                <CardEyebrow>Role viability</CardEyebrow>
                <CardTitle>Your market fit score</CardTitle>
                <div className="mt-md" style={{ display: 'flex', justifyContent: 'center' }}>
                  <ScoreRing score={model.viabilityScore} />
                </div>
                <CardMeta className="mt-md">
                  Your skills match <strong>{model.jobsMatchingAny}</strong> of <strong>{model.totalActiveJobs}</strong> active jobs
                </CardMeta>
              </Card>

              <Card className="studio-block">
                <CardEyebrow>Quick links</CardEyebrow>
                <div className="studio-stack mt-sm" style={{ gap: 8 }}>
                  <Button to="/intelligence/trends" variant="ghost">Industry trends</Button>
                  <Button to="/intelligence" variant="ghost">Skill gap analysis</Button>
                  <Button to="/jobs" variant="ghost">Browse all jobs</Button>
                  <Button to="/profile" variant="ghost">Edit my skills</Button>
                </div>
              </Card>
            </aside>
          </section>
        )}
      </section>
    </SiteLayout>
  );
}
