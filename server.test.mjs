import { test } from 'node:test';
import assert from 'node:assert/strict';
import { server } from './server.mjs';

test('lesson endpoint includes scenario family and glossary', async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const lesson = await (await fetch(`${base}/api/lesson/1`)).json();
    assert.equal(lesson.scenarios.length, 6);
    assert.equal(lesson.scenarios.filter(s => s.status === 'active').length, 3);
    assert.ok(Array.isArray(lesson.glossary) && lesson.glossary.length > 0);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('reveal requires prediction and invariant, then returns scenario outcome', async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const denied = await fetch(`${base}/api/reveal`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scenarioId: 's3-reentrant-attempt-reverts', prediction: 'too short', invariant: 'short' })
    });
    assert.equal(denied.status, 400);

    const allowed = await fetch(`${base}/api/reveal`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        scenarioId: 's3-reentrant-attempt-reverts',
        prediction: 'I predict one inner withdrawal succeeds but final accounting reverts because outer subtraction underflows.',
        invariant: 'A user must not end a reverted transaction with reduced vault solvency or altered recorded balances.'
      })
    });
    const payload = await allowed.json();
    assert.equal(allowed.status, 200);
    assert.equal(payload.outcomeStatus, 'reproduced');
    assert.match(payload.outcome, /reverts due to checked underflow/);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
