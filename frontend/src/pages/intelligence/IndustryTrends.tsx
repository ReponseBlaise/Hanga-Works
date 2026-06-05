import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { getIndustryTrends, type IndustryTrend } from '../../services/intelligence.service';

export default function IndustryTrends() {
  const [trends, setTrends] = useState<IndustryTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getIndustryTrends()
      .then((data) => {
        if (active) setTrends(data ?? []);
      })
      .catch((error) => {
        console.error('Failed to load industry trends', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <SiteLayout>
      <section className="studio-dashboard">
        <header className="studio-hero">
          <div className="studio-hero__intro">
            <p className="eyebrow">Industry intelligence</p>
            <h1 className="display-large">Skill demand and market trends</h1>
            <p className="lead">See which skills are most in-demand, related courses, and job opportunities.</p>
            <div className="studio-action-row mt-md">
              <Button to="/intelligence" variant="secondary">Back to intelligence</Button>
              <Button to="/courses" variant="primary">Browse courses</Button>
            </div>
          </div>
        </header>

        {loading ? (
          <Card className="studio-block mt-lg">
            <CardTitle>Loading industry trends...</CardTitle>
          </Card>
        ) : (
          <section className="studio-section mt-lg">
            <div className="studio-section__head">
              <div>
                <p className="eyebrow">Trending skills</p>
                <h2>Skills with highest demand</h2>
              </div>
            </div>
            
            <div className="studio-job-grid">
              {trends.map((trend) => (
                <Card key={trend.skillId} className="studio-block">
                  <div className="studio-job-card__head">
                    <div>
                      <CardEyebrow>Skill</CardEyebrow>
                      <CardTitle>{trend.skillName}</CardTitle>
                    </div>
                    <span className="dashboard-chip">{trend.jobCount} jobs</span>
                  </div>
                  
                  {trend.growthRate != null && (
                    <CardMeta className="mt-sm">
                      Growth: <strong>{trend.growthRate > 0 ? '+' : ''}{trend.growthRate}%</strong>
                    </CardMeta>
                  )}

                  <div className="mt-md">
                    <CardEyebrow>Related courses</CardEyebrow>
                    {trend.relatedCourses.length === 0 ? (
                      <CardMeta>No courses available yet.</CardMeta>
                    ) : (
                      <div className="studio-chip-row mt-sm">
                        {trend.relatedCourses.slice(0, 3).map((course) => (
                          <Link key={course.id} to={`/courses/${course.id}`} className="dashboard-chip">
                            {course.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-md">
                    <CardEyebrow>Related jobs</CardEyebrow>
                    {trend.relatedJobs.length === 0 ? (
                      <CardMeta>No jobs available.</CardMeta>
                    ) : (
                      <div className="studio-stack mt-sm">
                        {trend.relatedJobs.slice(0, 3).map((job) => (
                          <div key={job.id} className="studio-inline-item">
                            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                            <span className="muted">{job.employer.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="studio-action-row mt-md">
                    <Button to={`/jobs?skillId=${trend.skillId}`} variant="secondary" size="sm">
                      View all jobs
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {!loading && trends.length === 0 && (
              <Card className="studio-block">
                <CardTitle>No trends available</CardTitle>
                <CardMeta>Check back later as more jobs and skills are added to the platform.</CardMeta>
              </Card>
            )}
          </section>
        )}
      </section>
    </SiteLayout>
  );
}
