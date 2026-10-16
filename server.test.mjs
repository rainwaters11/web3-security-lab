import { test } from 'node:test';
import assert from 'node:assert/strict';
import { server } from './server.mjs';

async function withServer(run) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(base);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('lesson endpoint includes blocked solidity verification metadata', async () => {
  await withServer(async base => {
    const lesson = await (await fetch(`${base}/api/lesson/1`)).json();
    assert.equal(lesson.scenarios.length, 6);
    assert.equal(lesson.scenarios.filter(s => s.status === 'active').length, 3);
    assert.equal(lesson.solidityExecution.status, 'BLOCKED / NOT YET VERIFIED');
    assert.equal(lesson.deploymentMode, 'local-single-user');
  });
});

test('reveal requires both prediction and invariant', async () => {
  await withServer(async base => {
    const missingPrediction = await fetch(`${base}/api/reveal`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        scenarioId: 's1-normal-withdrawal',
        prediction: '',
        invariant: 'Invariant text that is long enough to pass length check.'
      })
    });
    assert.equal(missingPrediction.status, 400);

    const missingInvariant = await fetch(`${base}/api/reveal`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        scenarioId: 's1-normal-withdrawal',
        prediction: 'Prediction text that is long enough to pass the minimum length requirement.',
        invariant: ''
      })
    });
    assert.equal(missingInvariant.status, 400);
  });
});

test('independent mode keeps outcome hidden until submission flag', async () => {
  await withServer(async base => {
    const blocked = await fetch(`${base}/api/reveal`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        scenarioId: 's3-reentrant-attempt-reverts',
        prediction: 'I predict reentrant flow appears before rollback in this scenario setup.',
        invariant: 'A reverted transaction should not leave altered vault balances for this setup.',
        supportLevel: 'independent',
        submitted: false
      })
    });
    assert.equal(blocked.status, 400);
    assert.match((await blocked.json()).error, /hidden until you submit/i);

    const allowed = await fetch(`${base}/api/reveal`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        scenarioId: 's3-reentrant-attempt-reverts',
        prediction: 'I predict reentrant flow appears before rollback in this scenario setup.',
        invariant: 'A reverted transaction should not leave altered vault balances for this setup.',
        supportLevel: 'independent',
        submitted: true
      })
    });
    assert.equal(allowed.status, 200);
    const payload = await allowed.json();
    assert.equal(payload.outcomeStatus, 'not-yet-verified');
    assert.equal(payload.solidityExecutionStatus, 'BLOCKED / NOT YET VERIFIED');
  });
});

test('review queue resurfaces missing submission/explanation states', async () => {
  await withServer(async base => {
    const data = await (await fetch(`${base}/api/review-queue`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        attempts: [
          {
            scenarioId: 's3-reentrant-attempt-reverts',
            supportLevel: 'independent',
            outcomeStatus: 'suspected',
            explanation: 'too short'
          }
        ]
      })
    })).json();

    assert.ok(data.queue.some(item => /submit your/i.test(item.prompt)));
    assert.ok(data.queue.some(item => /revisit/i.test(item.prompt)));
    assert.ok(data.queue.some(item => /explain the execution trace/i.test(item.prompt)));
  });
});
