const $ = id => document.getElementById(id);
const key = 'web3-security-lab:shared-vault-01:v1';
let challenge;
let stage = 0;
let hintIndex = 0;
let savedTimer;

function note() { return { analysis: $('analysis').value, invariant: $('invariant').value, evidence: $('evidence').value, updatedAt: new Date().toISOString() }; }
function save() {
  try { localStorage.setItem(key, JSON.stringify(note())); $('saved').textContent = 'SAVED LOCALLY'; }
  catch { $('saved').textContent = 'SAVE FAILED — EXPORT NOTES'; }
}
function attempted() { return $('analysis').value.trim().length >= 20; }
function notice(message) { $('revealed').replaceChildren(); const p = document.createElement('p'); p.textContent = message; $('revealed').append(p); }
async function post(path, payload) {
  const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function renderReference(findings) {
  const host = $('revealed'); host.replaceChildren();
  for (const finding of findings) {
    const article = document.createElement('article');
    const h = document.createElement('h3'); h.textContent = finding.title;
    const reason = document.createElement('p'); reason.textContent = `Reason: ${finding.reason}`;
    const invariant = document.createElement('p'); invariant.textContent = `Invariant: ${finding.invariant}`;
    const fix = document.createElement('p'); fix.textContent = `Possible fix: ${finding.remediation}`;
    article.append(h, reason, invariant, fix); host.append(article);
  }
}
async function init() {
  const r = await fetch('/api/challenge'); challenge = await r.json();
  $('challenge-title').textContent = challenge.title;
  $('scenario').textContent = challenge.scenario;
  $('source').textContent = challenge.source;
  for (const prompt of challenge.prompts) { const li = document.createElement('li'); li.textContent = prompt; $('prompts').append(li); }
  try {
    const stored = JSON.parse(localStorage.getItem(key) || 'null');
    if (stored) { for (const field of ['analysis', 'invariant', 'evidence']) $(field).value = stored[field] || ''; $('saved').textContent = 'SAVED LOCALLY'; }
  } catch { $('saved').textContent = 'LOCAL NOTES UNAVAILABLE'; }
}
for (const field of ['analysis', 'invariant', 'evidence']) $(field).addEventListener('input', () => {
  $('saved').textContent = 'UNSAVED'; clearTimeout(savedTimer); savedTimer = setTimeout(save, 700);
});
$('save').addEventListener('click', save);
$('export').addEventListener('click', () => {
  const data = { challenge: challenge?.title || 'The Shared Vault', ...note() };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'security-lab-notes-001.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('ask').addEventListener('click', async () => {
  $('ask').disabled = true; $('coach-status').textContent = 'Thinking…';
  try {
    const result = await post('/api/coach', { analysis: $('analysis').value, stage, useAI: $('use-ai').checked });
    const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = result.reply;
    $('coach-thread').replaceChildren(bubble);
    $('coach-status').textContent = result.notice || (result.mode === 'ai' ? 'AI mentor · reasoning prompt' : 'Guided coach · available without an API key');
    if (attempted()) stage = Math.min(3, stage + 1);
  } catch (e) { $('coach-status').textContent = e.message; }
  finally { $('ask').disabled = false; }
});
$('hint').addEventListener('click', () => {
  if (!attempted()) return notice('Write at least 20 characters of your own analysis before seeing a hint.');
  if (hintIndex >= challenge.hints.length) return notice('You have seen all three hints. Test your claim, then compare the findings.');
  notice(`Hint ${hintIndex + 1} of ${challenge.hints.length}: ${challenge.hints[hintIndex++]}`);
});
$('reference').addEventListener('click', async () => {
  try {
    const data = await post('/api/reveal', { attempted: attempted(), analysis: $('analysis').value });
    renderReference(data.reference);
  } catch (e) { notice(e.message); }
});
init().catch(() => { $('challenge-title').textContent = 'Challenge unavailable'; });
