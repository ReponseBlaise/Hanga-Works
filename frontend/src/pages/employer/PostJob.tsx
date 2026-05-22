import React, { useState } from 'react';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function PostJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // For now keep local. Integration with jobs.service will follow.
    setPublished(true);
  }

  return (
    <section>
      <header className="page-header">
        <h2>Post a Job</h2>
      </header>

      <form onSubmit={onSubmit} className="form-stack">
        <label>
          Job Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
        </label>

        <div>
          <Button type="submit">Publish</Button>
          <Button variant="secondary" onClick={() => { setTitle(''); setDescription(''); }}>Reset</Button>
        </div>
      </form>

      {published && (
        <Card>
          <CardTitle>{title}</CardTitle>
          <p>{description}</p>
        </Card>
      )}
    </section>
  );
}
