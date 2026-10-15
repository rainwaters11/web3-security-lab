# Architecture and boundaries

## Existing application
- Node ES-module server: server.mjs. Static assets are explicitly allowlisted; APIs serve lessons, mentor/reveal behavior, glossary and review-related responses.
- Browser UI: public/index.html, public/app.js, public/style.css.
- State helpers: public/lessonState.mjs. Local storage keys are scoped by normalized learner ID and scenario records. This is local profile separation, not authentication or protection from another user of the browser profile.
- Tests: server.test.mjs and lessonState.test.mjs using Node's built-in test runner. No npm dependencies are currently required.
- Solidity: foundry/src and foundry/test; compiler pinned in foundry/foundry.toml. Forge executes separately from the web server.

## Draft game module
PR #1 introduces vault-room/ on its own branch with a localhost server and independent storage. It is not present on every branch. Read that PR before integration. A future integration should serve it under one route, reuse glossary and learner-state helpers, and preserve any existing notes. Resolve scenario actor differences before claiming a verified trace replay.

## AI and execution
The optional mentor uses a server-held API key. Guided learning remains usable without paid AI. Model responses are suggestions, never execution evidence or authoritative grades. Minimize submitted learner data and keep source content separate from trusted instructions.

No arbitrary code runner, repository execution endpoint, wallet connection, public deployment, shared database, or account-backed isolation is part of the approved initial architecture. Future execution must be separately isolated with no secrets, restricted network, resource/time limits, and a narrow job protocol. Do not extend the HTTP process with a shell command API.

## Verification
Node CI and Foundry CI are independent checks. UI verification is a separate manual/browser obligation. Foundry CI is configured by this change; check actual Actions results before calling it operational. GitHub required-status/branch-protection settings are not configured by adding a YAML file.

Preserve provenance with any real trace: source commit, compiler/EVM settings, exact command, runner version, raw result, scenario ID and assertions. A learner upload is learner-reported until validated; a boolean submitted from the browser must not create a verified badge.
