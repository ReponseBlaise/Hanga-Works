import { useEffect, useMemo, useState } from 'react';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { getCourses, type BackendCourse } from '../../services/courses.service';

export default function Blog() {
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCourses()
      .then((items) => {
        if (active) setCourses((items ?? []).filter((course) => course.published));
      })
      .catch((error) => {
        console.error('Failed to load blog feed', error);
        if (active) setCourses([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const posts = useMemo(() => {
    return courses.slice(0, 6).map((course) => ({
      id: course.id,
      title: course.title,
      category: course.institution?.name ?? 'LMS update',
      excerpt: course.description,
      modules: course._count?.modules ?? course.modules?.length ?? 0,
      enrollments: course._count?.enrollments ?? 0,
    }));
  }, [courses]);

  return (
    <SiteLayout>
      <div className="landing-page landing-page--nested">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <CardEyebrow>Blog</CardEyebrow>
            <h1>Insights from the live database.</h1>
            <p className="landing-lead">This feed is generated from published LMS courses and their live metadata instead of static blog cards.</p>
          </div>

          <div className="landing-hero__visual">
            <Card className="hero-visual-card">
              <CardTitle>Live feed</CardTitle>
              <CardMeta>{courses.length} published courses are available to surface as blog-style updates.</CardMeta>
              <CardMeta>Each card below reflects backend content.</CardMeta>
            </Card>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-blog-grid">
            {loading ? (
              <Card className="landing-blog-card">
                <div className="landing-blog-card__body">
                  <CardTitle>Loading updates…</CardTitle>
                  <CardMeta>Fetching published courses from the database.</CardMeta>
                </div>
              </Card>
            ) : null}

            {posts.map((post) => (
              <Card key={post.id} className="landing-blog-card">
                <div className="landing-blog-card__body">
                  <CardEyebrow>{post.category}</CardEyebrow>
                  <CardTitle>{post.title}</CardTitle>
                  <CardMeta>{post.excerpt}</CardMeta>
                  <div className="landing-blog-card__footer">
                    <div>
                      <span>Modules</span>
                      <strong>{post.modules}</strong>
                    </div>
                    <div>
                      <span>Enrollments</span>
                      <strong>{post.enrollments}</strong>
                    </div>
                    <Button to={`/courses/${post.id}`} variant="secondary">Open course</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="landing-blog-actions">
            <Button to="/courses" variant="primary">Browse all courses</Button>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
