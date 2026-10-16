export function normalizeLearnerId(raw) {
  const cleaned = String(raw || '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return cleaned || 'local-single-user';
}

export function buildStorageKeys(learnerId) {
  const id = normalizeLearnerId(learnerId);
  return {
    learnerId: `web3-security-lab:lesson1:learner-id:v1`,
    attempts: `web3-security-lab:lesson1:${id}:attempts:v1`,
    bookmarks: `web3-security-lab:lesson1:${id}:bookmarks:v1`,
    reviewQueue: `web3-security-lab:lesson1:${id}:review-queue:v1`
  };
}

export function searchGlossary(terms, query, category = 'all') {
  const q = String(query || '').trim().toLowerCase();
  return (terms || []).filter(term => {
    const text = `${term.term} ${term.definition} ${term.technicalMeaning} ${term.category} ${term.group}`.toLowerCase();
    const textMatch = !q || text.includes(q);
    const categoryMatch = category === 'all' || term.category === category;
    return textMatch && categoryMatch;
  });
}

export function toggleBookmark(bookmarks, termId) {
  const next = new Set(bookmarks || []);
  if (next.has(termId)) next.delete(termId);
  else next.add(termId);
  return next;
}

export function canReveal({ prediction, invariant, supportLevel, submitted }) {
  if (String(prediction || '').trim().length < 20) return false;
  if (String(invariant || '').trim().length < 20) return false;
  if (supportLevel === 'independent' && submitted !== true) return false;
  return true;
}

export function createStorageRepo(storage, learnerId) {
  const keys = buildStorageKeys(learnerId);

  function readJSON(key, fallback) {
    try {
      const raw = storage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    storage.setItem(key, JSON.stringify(value));
  }

  return {
    keys,
    readAttempts() { return readJSON(keys.attempts, {}); },
    writeAttempts(attempts) { writeJSON(keys.attempts, attempts); },
    readBookmarks() { return new Set(readJSON(keys.bookmarks, [])); },
    writeBookmarks(bookmarks) { writeJSON(keys.bookmarks, [...bookmarks]); },
    readReviewQueue() { return readJSON(keys.reviewQueue, []); },
    writeReviewQueue(queue) { writeJSON(keys.reviewQueue, queue); }
  };
}
