import { createStorageRepo, normalizeLearnerId, searchGlossary, toggleBookmark, canReveal } from './lessonState.mjs';

const $ = id => document.getElementById(id);

let lesson;
let currentScenarioId;
let termSelection;
let hintsUsed = {};
let storageRepo;
let learnerId;

function scenario() {
  return lesson.scenarios.find(s => s.id === currentScenarioId);
}

async function post(path, payload) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function getAttemptMap() {
  return storageRepo.readAttempts();
}

function writeAttemptMap(map) {
  storageRepo.writeAttempts(map);
}

function currentAttempt() {
  return getAttemptMap()[currentScenarioId] || {};
}

function loadAttempt() {
  const item = currentAttempt();
  $('prediction').value = item.prediction || '';
  $('invariant').value = item.invariant || '';
  $('evidence').value = item.evidence || '';
  $('explanation').value = item.explanation || '';
  $('support-level').value = item.supportLevel || 'guided';
  hintsUsed[currentScenarioId] = item.hintsUsed || 0;
  $('saved').textContent = item.updatedAt ? `Saved ${new Date(item.updatedAt).toLocaleString()}` : 'Unsaved';
}

function saveAttempt(extra = {}) {
  const attempts = getAttemptMap();
  const existing = attempts[currentScenarioId] || {};
  attempts[currentScenarioId] = {
    ...existing,
    ...extra,
    scenarioId: currentScenarioId,
    prediction: $('prediction').value,
    invariant: $('invariant').value,
    evidence: $('evidence').value,
    explanation: $('explanation').value,
    supportLevel: $('support-level').value,
    hintsUsed: hintsUsed[currentScenarioId] || 0,
    updatedAt: new Date().toISOString()
  };
  writeAttemptMap(attempts);
  $('saved').textContent = 'Saved locally';
}

function renderScenarios() {
  const host = $('scenario-list');
  host.replaceChildren();
  for (const s of lesson.scenarios) {
    const btn = document.createElement('button');
    btn.className = `scenario-item ${s.id === currentScenarioId ? 'active' : ''}`;
    btn.type = 'button';
    btn.setAttribute('role', 'listitem');
    btn.textContent = `${s.order}. ${s.title} (${s.status})`;
    btn.addEventListener('click', () => {
      currentScenarioId = s.id;
      renderScenarios();
      renderScenario();
    });
    host.append(btn);
  }
}

function renderScenario() {
  const s = scenario();
  $('scenario-title').textContent = s.title;
  $('scenario-summary').textContent = s.summary;
  $('scenario-test').textContent = s.localTest;
  $('source').textContent = s.source;
  $('coach').textContent = '';
  $('hint-box').textContent = '';
  $('outcome').textContent = '';
  loadAttempt();
}

function renderTermPanel() {
  const t = termSelection;
  const bookmarks = storageRepo.readBookmarks();

  if (!t) {
    $('bookmark').disabled = true;
    $('term-name').textContent = 'Select a term';
    $('term-definition').textContent = '';
    $('term-technical').textContent = '';
    $('term-example').textContent = '';
    $('term-why').textContent = '';
    $('term-misunderstanding').textContent = '';
    $('term-related').textContent = '';
    return;
  }

  $('bookmark').disabled = false;
  $('bookmark').textContent = bookmarks.has(t.id) ? 'Remove bookmark' : 'Bookmark term';
  $('term-name').textContent = t.term;
  $('term-definition').textContent = `Plain definition: ${t.definition}`;
  $('term-technical').textContent = `Technical meaning: ${t.technicalMeaning}`;
  $('term-example').textContent = `Contract example: ${t.example}`;
  $('term-why').textContent = `Security relevance: ${t.whyImportant}`;
  $('term-misunderstanding').textContent = `Common misunderstanding: ${t.misunderstanding}`;
  $('term-related').textContent = `Related terms: ${t.related.join(', ')}`;
}

function renderGlossary() {
  const host = $('term-list');
  host.replaceChildren();
  const terms = searchGlossary(lesson.glossary, $('term-search').value, $('term-category').value);
  const bookmarks = storageRepo.readBookmarks();

  for (const t of terms) {
    const button = document.createElement('button');
    button.className = `term-item ${termSelection?.id === t.id ? 'active' : ''}`;
    button.type = 'button';
    button.setAttribute('role', 'listitem');
    button.textContent = `${bookmarks.has(t.id) ? '★ ' : ''}${t.term} · ${t.group}`;
    button.addEventListener('click', () => {
      termSelection = t;
      renderTermPanel();
      renderGlossary();
    });
    host.append(button);
  }
}

function renderQueue(queue) {
  const host = $('queue');
  host.replaceChildren();
  for (const item of queue) {
    const p = document.createElement('p');
    p.textContent = `• ${item.prompt}`;
    host.append(p);
  }
}

async function refreshReviewQueue() {
  const attempts = Object.values(getAttemptMap());
  const data = await post('/api/review-queue', { attempts });
  storageRepo.writeReviewQueue(data.queue);
  renderQueue(data.queue);
}

function applyLearner(id) {
  learnerId = normalizeLearnerId(id);
  storageRepo = createStorageRepo(localStorage, learnerId);
  localStorage.setItem(storageRepo.keys.learnerId, learnerId);
  $('learner-id').value = learnerId;

  const persistedQueue = storageRepo.readReviewQueue();
  renderQueue(persistedQueue);
  renderScenario();
  renderGlossary();
  renderTermPanel();
}

async function init() {
  lesson = await (await fetch('/api/lesson/1')).json();
  $('lesson-title').textContent = lesson.title;
  $('deployment-note').textContent = `${lesson.deploymentModeNote} (${lesson.solidityExecution.status})`;

  const categories = ['all', ...new Set(lesson.glossary.map(t => t.category))];
  $('term-category').replaceChildren(...categories.map(c => {
    const option = document.createElement('option');
    option.value = c;
    option.textContent = c === 'all' ? 'All categories' : c;
    return option;
  }));

  currentScenarioId = lesson.scenarios[0].id;
  renderScenarios();

  const defaultLearner = normalizeLearnerId(localStorage.getItem('web3-security-lab:lesson1:learner-id:v1') || 'local-single-user');
  applyLearner(defaultLearner);

  refreshReviewQueue().catch(() => {});
}

$('save').addEventListener('click', () => saveAttempt());
$('submit').addEventListener('click', () => {
  saveAttempt({ submittedAt: new Date().toISOString() });
  $('coach').textContent = 'Attempt submitted. You can now reveal outcome in independent mode.';
});

$('switch-learner').addEventListener('click', () => {
  applyLearner($('learner-id').value);
  $('coach').textContent = `Loaded learner profile: ${learnerId}`;
});

for (const id of ['prediction', 'invariant', 'evidence', 'explanation', 'support-level']) {
  $(id).addEventListener('input', () => { $('saved').textContent = 'Unsaved'; });
  $(id).addEventListener('change', () => { $('saved').textContent = 'Unsaved'; });
}

$('hint').addEventListener('click', () => {
  const s = scenario();
  const attempt = currentAttempt();
  if (attempt.supportLevel === 'independent' && !attempt.submittedAt) {
    $('hint-box').textContent = 'Independent mode: hints remain hidden until you submit your attempt.';
    return;
  }

  const used = hintsUsed[currentScenarioId] || 0;
  if (used >= s.hints.length) {
    $('hint-box').textContent = 'No more hints for this scenario.';
    return;
  }

  hintsUsed[currentScenarioId] = used + 1;
  saveAttempt({ hintsUsed: hintsUsed[currentScenarioId] });
  $('hint-box').textContent = `Hint ${hintsUsed[currentScenarioId]}: ${s.hints[used]}`;
});

$('ask').addEventListener('click', async () => {
  try {
    const data = await post('/api/coach', {
      scenarioId: currentScenarioId,
      supportLevel: $('support-level').value,
      prediction: $('prediction').value,
      invariant: $('invariant').value,
      evidence: $('evidence').value
    });
    $('coach').textContent = data.reply;
  } catch (err) {
    $('coach').textContent = err.message;
  }
});

$('reveal').addEventListener('click', async () => {
  const attempt = currentAttempt();
  const submitted = Boolean(attempt.submittedAt);
  const supportLevel = $('support-level').value;

  if (!canReveal({ prediction: $('prediction').value, invariant: $('invariant').value, supportLevel, submitted })) {
    $('outcome').textContent = supportLevel === 'independent' && !submitted
      ? 'Independent mode requires submission before reveal, plus prediction and invariant.'
      : 'Prediction and invariant must each be at least 20 characters before reveal.';
    return;
  }

  try {
    const data = await post('/api/reveal', {
      scenarioId: currentScenarioId,
      prediction: $('prediction').value,
      invariant: $('invariant').value,
      supportLevel,
      submitted
    });

    saveAttempt({ outcomeStatus: data.outcomeStatus, outcomeLabel: data.outcomeLabel });
    $('outcome').textContent = [
      `Outcome (${data.outcomeStatus}): ${data.outcome}`,
      `Expected assertions: ${data.expectedAssertions.join(' | ')}`,
      `Trace question: ${data.traceQuestion}`,
      `Boundary question: ${data.limitQuestion}`,
      `Solidity execution status: ${data.solidityExecutionStatus}`,
      `Reminder: ${data.reminder}`
    ].join('\n\n');
    refreshReviewQueue().catch(() => {});
  } catch (err) {
    $('outcome').textContent = err.message;
  }
});

$('review-queue').addEventListener('click', () => {
  refreshReviewQueue().catch(err => { $('queue').textContent = err.message; });
});

$('term-search').addEventListener('input', renderGlossary);
$('term-category').addEventListener('change', renderGlossary);
$('bookmark').addEventListener('click', () => {
  if (!termSelection) return;
  const next = toggleBookmark(storageRepo.readBookmarks(), termSelection.id);
  storageRepo.writeBookmarks(next);
  renderTermPanel();
  renderGlossary();
});

init().catch(() => {
  $('lesson-title').textContent = 'Lesson failed to load.';
});
