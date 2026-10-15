# The Ledger Lock — playable room prototype

An original comic-style vault investigation with three cases: normal withdrawal, excess withdrawal, and a once-reentrant withdrawal that rolls back. This is a learning game, not a smart-contract security certification.

## Run

From the repository root, with Node 20+:

```sh
node vault-room/server.mjs
```

Open http://127.0.0.1:3001. No dependency installation, wallet, API key, or paid service is needed. Run `npm test` for the existing application checks plus the room's model checks.

## Coordination with Copilot

This module was started from commit `07bec4612655a91b8124b0493c9922a6a8e50a69` on `copilot/inspect-repository-files`. It lives entirely under `vault-room/` to avoid changing Copilot's active server, lesson files, UI, Foundry tests, or glossary state. Its Node server binds only to localhost and allowlists four assets. It exposes no contract execution API.

Integration next: after reviewing both branches, mount these four assets under a dedicated prefix in the existing server (including module-relative imports) and add a room link. Reconcile the room's teaching glossary with the existing glossary rather than maintaining divergent definitions. Keep existing lesson and learner state intact. Do not merge a stale branch over newer Copilot work.

## Browser APIs used

- Web Animations API: small balance transitions; respects system and manual reduced-motion preferences.
- Web Audio API: a synthesized, optional interaction tone activated only after a user click; defaults off.
- Web Storage API: notes and walkthrough completion in a distinct `vault-room:v1` key.
- Blob and URL APIs: download case notes as JSON.
- Native dialog: searchable field guide with keyboard dismissal and modal focus behavior.

These progressive enhancements require no network calls. No game engine or external backend is needed for this small room. Animation and audio failures must not block reasoning or progression.

## Evidence model

All transaction steps are hand-authored illustrative states. They are not actual Forge traces. The UI and exports explicitly record Solidity execution as unverified. Alice is modeled as a contract that deposited before the withdrawal transaction; Bob's deposit also predates it. Gas fees are excluded. A reentrant recipient calls back only once.

Completion requires a prediction, invariant, viewing the final state, correct factual outcome, correct evidence classification, and a written explanation. Length checks only enforce an attempt; they do not grade prose. Written reasoning remains pending review. Local completion can be edited by the user and is not an authenticated credential. Source inspection can reveal answers; this is a learning aid, not a secure examination system.

Local storage is browser-profile scoped, not account isolation. Do not use shared browser profiles for private notes. Progress supports malformed/unavailable storage fallback and JSON export, but not cloud sync, multi-user accounts, independent skill assessment, or import of executed traces yet.

## Manual playthrough

1. Open the room and inspect desktop and narrow mobile layouts.
2. Write a prediction and invariant; confirm short/empty attempts cannot enter.
3. Step through each case; check normal final balances 2/0/2, excess 3/1/2, and reentrant rollback 3/1/2 (vault/Alice credit/Bob credit).
4. Submit an incorrect outcome and a false claim of executed evidence. Confirm neither completes the case.
5. Submit the supported outcome, illustrative evidence classification, and your explanation. Confirm completion is separate from mastery.
6. Reload, switch cases, and confirm saved notes and completion remain separate.
7. Search the glossary and close it with Escape. Check keyboard use, sound off/on, reduced motion, and JSON export.

## Next verification milestone

Run the existing Foundry exercises in a working toolchain. Preserve compiler version, source commit, exact command, actual output, and assertions with any imported trace. Do not upgrade the evidence badge solely because a learner or model says a test passed. Then add the contrasting vulnerable/CEI exercises described in DOJO-INTEGRATION.md.
