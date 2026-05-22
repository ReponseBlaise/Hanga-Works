import React, { useMemo, useState } from 'react';
import { Card, CardTitle, CardMeta } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useNavigate } from 'react-router-dom';

type Candidate = {
  id: string;
  name: string;
  email: string;
  stage: 'Applied' | 'Reviewing' | 'Shortlisted' | 'Hired';
  summary?: string;
};

const pipelineStages: Candidate['stage'][] = ['Applied', 'Reviewing', 'Shortlisted', 'Hired'];

const initialCandidates: Candidate[] = [
  { id: 'c1', name: 'Ada Lovelace', email: 'ada@example.com', stage: 'Applied', summary: 'Experienced developer and mathematician.' },
  { id: 'c2', name: 'Alan Turing', email: 'alan@example.com', stage: 'Reviewing', summary: 'Strong systems thinker.' },
  { id: 'c3', name: 'Grace Hopper', email: 'grace@example.com', stage: 'Shortlisted', summary: 'Compiler expert.' },
];

export default function Applicants() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [active, setActive] = useState<Candidate | null>(null);
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const map: Record<string, Candidate[]> = {};
    pipelineStages.forEach((s) => (map[s] = []));
    candidates.forEach((c) => map[c.stage].push(c));
    return map as Record<Candidate['stage'], Candidate[]>;
  }, [candidates]);

  function moveCandidate(id: string, to: Candidate['stage']) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, stage: to } : c)));
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

      <div className="kanban">
        {pipelineStages.map((stage) => (
          <div className="kanban-column" key={stage}>
            <h3 className="kanban-title">{stage}</h3>
            <div className="kanban-list">
              {grouped[stage].map((c) => (
                <article key={c.id} className="kanban-card" onClick={() => setActive(c)}>
                  <Card>
                    <CardTitle>{c.name}</CardTitle>
                    <CardMeta>{c.email}</CardMeta>
                  </Card>
                </article>
              ))}
            </div>
            <div className="kanban-actions">
              {stage !== 'Hired' && (
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
          {active && active.stage !== 'Hired' && (
            <Button onClick={() => moveCandidate(active.id, pipelineStages[pipelineStages.indexOf(active.stage) + 1])}>Move to next</Button>
          )}
          <Button variant="secondary" onClick={() => setActive(null)}>Close</Button>
        </div>
      }>
        {active ? (
          <div>
            <p><strong>Email:</strong> {active.email}</p>
            <p>{active.summary}</p>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
