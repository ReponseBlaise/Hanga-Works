import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardTitle, CardEyebrow } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { createCourseTest, getCourseTest } from '../../services/courses.service';

export default function CourseTestEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState('Please answer all questions. You need 80% to pass.');
  const [passingScore, setPassingScore] = useState(80);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const addQuestion = useCallback(() => {
    setQuestions([...questions, { question: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]);
  }, [questions]);

  useEffect(() => {
    if (!id) return;
    getCourseTest(id)
      .then((test) => {
        if (test) {
          setInstructions(test.instructions || '');
          setPassingScore(test.passingScore || 80);
          setQuestions(test.questions || []);
        }
      })
      .catch((err) => {
        // If 404, it means no test exists yet, which is fine.
        console.log('No existing test found or error', err);
        if (questions.length === 0) {
          addQuestion(); // Add one default empty question
        }
      })
      .finally(() => setLoading(false));
  }, [id, addQuestion, questions.length]);

  const addOption = (qIndex: number) => {
    const newQs = [...questions];
    newQs[qIndex].options.push({ text: '', isCorrect: false });
    setQuestions(newQs);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await createCourseTest(id, { instructions, passingScore, questions });
      alert('Test saved successfully');
      navigate(`/courses/${id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to save test');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SiteLayout><p style={{ padding: '24px' }}>Loading test editor...</p></SiteLayout>;

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <div className="studio-dashboard dashboard-redesign" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
          <header className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Course Test Editor</p>
              <h1 className="display">Manage Final Test</h1>
              <p className="lead">Define the questions and passing score required for learners to complete this course.</p>
            </div>
            <div className="studio-action-row">
              <Button to={`/courses/${id}`} variant="secondary">Back to Course</Button>
            </div>
          </header>

          <Card className="studio-block mt-lg">
            <CardEyebrow>Test Settings</CardEyebrow>
            <div className="form-stack mt-md">
              <label>
                Instructions for learners
                <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} />
              </label>
              <label>
                Passing Score (%)
                <input type="number" min="1" max="100" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} />
              </label>
            </div>
          </Card>

          <div style={{ marginTop: '32px' }}>
            <h2 style={{ marginBottom: '16px' }}>Questions</h2>
            {questions.map((q, qIndex) => (
              <Card key={qIndex} className="studio-block mb-md" style={{ border: '2px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <CardTitle>Question {qIndex + 1}</CardTitle>
                  <Button variant="ghost" type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} style={{ color: 'red' }}>Remove</Button>
                </div>
                <div className="form-stack mt-md">
                  <input type="text" placeholder="Question text..." value={q.question} onChange={e => {
                    const newQs = [...questions];
                    newQs[qIndex].question = e.target.value;
                    setQuestions(newQs);
                  }} />
                  
                  <div style={{ marginTop: '16px' }}>
                    <CardEyebrow>Options</CardEyebrow>
                    {q.options.map((opt: any, oIndex: number) => (
                      <div key={oIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <input type="radio" name={`correct-${qIndex}`} checked={opt.isCorrect} onChange={() => {
                          const newQs = [...questions];
                          newQs[qIndex].options.forEach((o: any, i: number) => o.isCorrect = (i === oIndex));
                          setQuestions(newQs);
                        }} />
                        <input type="text" placeholder="Option text..." value={opt.text} style={{ flex: 1 }} onChange={e => {
                          const newQs = [...questions];
                          newQs[qIndex].options[oIndex].text = e.target.value;
                          setQuestions(newQs);
                        }} />
                        <button type="button" onClick={() => {
                          const newQs = [...questions];
                          newQs[qIndex].options = newQs[qIndex].options.filter((_: any, i: number) => i !== oIndex);
                          setQuestions(newQs);
                        }} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}>✕</button>
                      </div>
                    ))}
                    <Button variant="ghost" type="button" onClick={() => addOption(qIndex)}>+ Add Option</Button>
                  </div>
                </div>
              </Card>
            ))}

            <Button variant="secondary" onClick={addQuestion}>+ Add another question</Button>
          </div>

          <div className="mt-xl" style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Test Configuration'}
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
