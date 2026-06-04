import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardTitle, CardMeta, CardEyebrow } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getCourseTest, submitTestAttempt } from '../../services/courses.service';

export default function CourseTestAttempt() {
  const { id } = useParams<{ id: string }>();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    getCourseTest(id)
      .then((data) => setTest(data))
      .catch((err) => {
        console.error(err);
        setTest(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await submitTestAttempt(id, answers);
      setResult(res);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SiteLayout><p style={{ padding: '24px' }}>Loading test...</p></SiteLayout>;

  if (!test) {
    return (
      <SiteLayout>
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <Card>
            <CardTitle>Test Not Available</CardTitle>
            <CardMeta>The instructor has not published a final test for this course yet.</CardMeta>
            <div className="mt-md"><Button to={`/courses/${id}`} variant="secondary">Back to Course</Button></div>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="app-shell-layout" style={{ background: 'var(--bg-muted)', minHeight: '100vh' }}>
        <div className="studio-dashboard dashboard-redesign" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
          
          <header className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Final Assessment</p>
              <h1 className="display">Course Test</h1>
              <p className="lead">{test.instructions || 'Please answer all questions carefully.'}</p>
            </div>
            <div className="studio-action-row">
              <Button to={`/courses/${id}`} variant="ghost">Exit Test</Button>
            </div>
          </header>

          {result ? (
            <Card className="mt-lg" style={{ border: result.passed ? '2px solid green' : '2px solid orange', textAlign: 'center', padding: '40px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '16px', color: result.passed ? 'green' : 'orange' }}>
                {result.passed ? '🎉 You Passed!' : 'You Did Not Pass'}
              </h2>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>Your Score: <strong>{result.score}%</strong></p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Required to pass: {result.passingScore}%</p>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                {result.passed ? (
                  <Button to="/profile" variant="primary">View My Certificate</Button>
                ) : (
                  <Button variant="primary" onClick={() => {
                    setResult(null);
                    setAnswers({});
                  }}>Retake Test</Button>
                )}
                <Button to={`/courses/${id}`} variant="secondary">Back to Course</Button>
              </div>
            </Card>
          ) : (
            <div className="mt-xl">
              {test.questions.map((q: any, i: number) => (
                <Card key={q.id} className="studio-block mb-md" style={{ background: 'var(--surface)', padding: '32px' }}>
                  <CardEyebrow>Question {i + 1} of {test.questions.length}</CardEyebrow>
                  <h3 style={{ fontSize: '20px', margin: '16px 0', lineHeight: '1.4' }}>{q.question}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                    {q.options.map((opt: any) => (
                      <label 
                        key={opt.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          padding: '16px', 
                          border: answers[q.id] === opt.id ? '2px solid var(--primary)' : '1px solid var(--border)', 
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: answers[q.id] === opt.id ? 'var(--primary-light)' : 'transparent'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={`q-${q.id}`} 
                          value={opt.id} 
                          checked={answers[q.id] === opt.id}
                          onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                          style={{ width: '20px', height: '20px' }}
                        />
                        <span style={{ fontSize: '16px' }}>{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              ))}

              <div className="mt-xl mb-xl" style={{ display: 'flex', justifyContent: 'flex-end', padding: '24px 0', borderTop: '1px solid var(--border)' }}>
                <Button 
                  variant="primary" 
                  disabled={submitting || Object.keys(answers).length < test.questions.length} 
                  onClick={handleSubmit}
                >
                  {submitting ? 'Submitting...' : 'Submit Final Test'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
