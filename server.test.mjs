import { test } from 'node:test';
import assert from 'node:assert/strict';
import { server, handleCoach } from './server.mjs';

test('mentor asks for a rule before advancing a vague claim', () => {
  assert.match(handleCoach({ analysis: 'Something looks suspicious', stage: 0 }).reply, /rule/);
});

test('reference requires a written attempt; challenge response excludes answers', async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const challenge = await (await fetch(`${base}/api/challenge`)).json();
    assert.equal(challenge.reference, undefined);
    const denied = await fetch(`${base}/api/reveal`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attempted: true, analysis: 'short' }) });
    assert.equal(denied.status, 400);
    const allowed = await fetch(`${base}/api/reveal`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attempted: true, analysis: 'I suspect a broken authorization check.' }) });
    assert.equal((await allowed.json()).reference.length, 2);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
