import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildStorageKeys, canReveal, createStorageRepo, normalizeLearnerId, searchGlossary, toggleBookmark } from './public/lessonState.mjs';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, value); }
}

test('scenario progress remains separate by scenario id', () => {
  const storage = new MemoryStorage();
  const repo = createStorageRepo(storage, 'learner-a');

  const attempts = {
    's1-normal-withdrawal': { scenarioId: 's1-normal-withdrawal', prediction: 'p1' },
    's2-excess-withdrawal': { scenarioId: 's2-excess-withdrawal', prediction: 'p2' }
  };
  repo.writeAttempts(attempts);

  const read = repo.readAttempts();
  assert.equal(read['s1-normal-withdrawal'].prediction, 'p1');
  assert.equal(read['s2-excess-withdrawal'].prediction, 'p2');
});

test('learner-scoped keys isolate state between learners', () => {
  const storage = new MemoryStorage();
  const repoA = createStorageRepo(storage, 'alice');
  const repoB = createStorageRepo(storage, 'bob');

  repoA.writeAttempts({ 's1-normal-withdrawal': { prediction: 'alice notes' } });
  repoB.writeAttempts({ 's1-normal-withdrawal': { prediction: 'bob notes' } });

  assert.equal(repoA.readAttempts()['s1-normal-withdrawal'].prediction, 'alice notes');
  assert.equal(repoB.readAttempts()['s1-normal-withdrawal'].prediction, 'bob notes');
  assert.notEqual(repoA.keys.attempts, repoB.keys.attempts);
});

test('glossary search filters by query/category and bookmark persistence round-trips', () => {
  const terms = [
    { term: 'balanceOf', definition: 'credit mapping', technicalMeaning: 'mapping', category: 'reading-contract', group: 'developer-name' },
    { term: 'invariant', definition: 'rule', technicalMeaning: 'state property', category: 'security-reasoning', group: 'general' }
  ];
  const found = searchGlossary(terms, 'mapping', 'reading-contract');
  assert.equal(found.length, 1);
  assert.equal(found[0].term, 'balanceOf');

  const storage = new MemoryStorage();
  const repo = createStorageRepo(storage, 'learner-c');
  let marks = toggleBookmark(repo.readBookmarks(), 'invariant');
  repo.writeBookmarks(marks);
  marks = repo.readBookmarks();
  assert.equal(marks.has('invariant'), true);
});

test('review queue persistence round-trips independently per learner', () => {
  const storage = new MemoryStorage();
  const repoA = createStorageRepo(storage, 'alpha');
  const repoB = createStorageRepo(storage, 'beta');

  repoA.writeReviewQueue([{ scenarioId: 's3', prompt: 'Revisit s3' }]);
  repoB.writeReviewQueue([{ scenarioId: 's1', prompt: 'Revisit s1' }]);

  assert.equal(repoA.readReviewQueue()[0].scenarioId, 's3');
  assert.equal(repoB.readReviewQueue()[0].scenarioId, 's1');
});

test('canReveal enforces independent submission and prediction/invariant presence', () => {
  const base = {
    prediction: 'Prediction text long enough for requirement.',
    invariant: 'Invariant text long enough for requirement.'
  };

  assert.equal(canReveal({ ...base, supportLevel: 'guided', submitted: false }), true);
  assert.equal(canReveal({ ...base, supportLevel: 'independent', submitted: false }), false);
  assert.equal(canReveal({ ...base, supportLevel: 'independent', submitted: true }), true);
  assert.equal(canReveal({ ...base, prediction: 'short', supportLevel: 'guided', submitted: true }), false);
});

test('normalizeLearnerId and key building stay deterministic', () => {
  assert.equal(normalizeLearnerId(' Alice Smith '), 'alice-smith');
  const keys = buildStorageKeys('Alice Smith');
  assert.match(keys.attempts, /alice-smith/);
});
