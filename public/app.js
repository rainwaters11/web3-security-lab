const $ = id => document.getElementById(id);
const attemptsKey = 'web3-security-lab:lesson1:attempts:v2';
const bookmarksKey = 'web3-security-lab:lesson1:bookmarks:v1';

let lesson;
let currentScenarioId;
let termSelection;
let hintsUsed = {};

function readAttempts() {
  try { return JSON.parse(localStorage.getItem(attemptsKey) || '{}'); } catch { return {}; }
}
function writeAttempts(data) {
  localStorage.setItem(attemptsKey, JSON.stringify(data));
}
function readBookmarks() {
  try { return new Set(JSON.parse(localStorage.getItem(bookmarksKey) || '[]')); } catch { return new Set(); }
}
function writeBookmarks(set) {
  localStorage.setItem(bookmarksKey, JSON.stringify([...set]));
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

function currentScenario() {
  return lesson.scenarios.find(s => s.id === currentScenarioId);
}

function loadAttempt() {
  const attempts = readAttempts();
  const item = attempts[currentScenarioId] || {};
  $('prediction').value = item.prediction || '';
  $('invariant').value = item.invariant || '';
  $('evidence').value = item.evidence || '';
  $('explanation').value = item.explanation || '';
  $('support-level').value = item.supportLevel || 'guided';
  hintsUsed[currentScenarioId] = item.hintsUsed || 0;
  $('saved').textContent = item.updatedAt ? `Saved ${new Date(item.updatedAt).toLocaleString()}` : 'Unsaved';
}

function saveAttempt(extra = {}) {
  const attempts = readAttempts();
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
  writeAttempts(attempts);
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
  const s = currentScenario();
  $('scenario-title').textContent = s.title;
  $('scenario-summary').textContent = s.summary;
  $('scenario-test').textContent = s.localTest;
  $('source').textContent = s.source;
  $('coach').textContent = '';
  $('hint-box').textContent = '';
  $('outcome').textContent = '';
  loadAttempt();
}

function renderGlossary() {
  const q = $('term-search').value.trim().toLowerCase();
  const cat = $('term-category').value;
  const bookmarks = readBookmarks();
  const host = $('term-list');
  host.replaceChildren();

  const terms = lesson.glossary.filter(t => {
    const text = `${t.term} ${t.definition} ${t.technicalMeaning} ${t.category}`.toLowerCase();
    const textMatch = !q || text.includes(q);
    const catMatch = cat === 'all' || t.category === cat;
    return textMatch && catMatch;
  });

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

function renderTermPanel() {
  const t = termSelection;
  const bookmarks = readBookmarks();
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

async function refreshReviewQueue() {
  const attempts = Object.values(readAttempts());
  const data = await post('/api/review-queue', { attempts });
  const host = $('queue');
  host.replaceChildren();
  for (const item of data.queue) {
    const p = document.createElement('p');
    p.textContent = `• ${item.prompt}`;
    host.append(p);
  }
}

async function init() {
  lesson = await (await fetch('/api/lesson/1')).json();
  $('lesson-title').textContent = `${lesson.title}`;

  const categories = ['all', ...new Set(lesson.glossary.map(t => t.category))];
  $('term-category').replaceChildren(...categories.map(c => {
    const option = document.createElement('option');
    option.value = c;
    option.textContent = c === 'all' ? 'All categories' : c;
    return option;
  }));

  currentScenarioId = lesson.scenarios[0].id;
  renderScenarios();
  renderScenario();
  renderGlossary();
  renderTermPanel();
  refreshReviewQueue().catch(() => {});
}

$('save').addEventListener('click', () => saveAttempt());
for (const id of ['prediction', 'invariant', 'evidence', 'explanation', 'support-level']) {
  $(id).addEventListener('input', () => { $('saved').textContent = 'Unsaved'; });
  $(id).addEventListener('change', () => { $('saved').textContent = 'Unsaved'; });
}

$('hint').addEventListener('click', () => {
  const s = currentScenario();
  const used = hintsUsed[currentScenarioId] || 0;
  if (used >= s.hints.length) {
    $('hint-box').textContent = 'No more hints for this scenario.';
    return;
  }
  const next = s.hints[used];
  hintsUsed[currentScenarioId] = used + 1;
  saveAttempt({ hintsUsed: hintsUsed[currentScenarioId] });
  $('hint-box').textContent = `Hint ${hintsUsed[currentScenarioId]}: ${next}`;
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
  try {
    const data = await post('/api/reveal', {
      scenarioId: currentScenarioId,
      prediction: $('prediction').value,
      invariant: $('invariant').value
    });
    saveAttempt({ outcomeStatus: data.outcomeStatus, outcomeLabel: data.outcomeLabel });
    $('outcome').textContent = [
      `Outcome (${data.outcomeStatus}): ${data.outcome}`,
      `Expected assertions: ${data.expectedAssertions.join(' | ')}`,
      `Trace question: ${data.traceQuestion}`,
      `Boundary question: ${data.limitQuestion}`,
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
  const set = readBookmarks();
  if (set.has(termSelection.id)) set.delete(termSelection.id);
  else set.add(termSelection.id);
  writeBookmarks(set);
  renderTermPanel();
  renderGlossary();
  refreshReviewQueue().catch(() => {});
});

init().catch(() => {
  $('lesson-title').textContent = 'Lesson failed to load.';
});
