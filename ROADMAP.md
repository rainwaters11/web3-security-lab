# ROADMAP

## Current state (2026-10-15; branch-aware)
- Runnable Node source, lesson UI, glossary, learner-scoped local state and tests are tracked on the Copilot development branch and its descendants. At the last inspection main still held the initial ZIP; check current refs before relying on that statement.
- Scenarios 1–3 have Solidity test source. Scenarios 4–6 are scaffolds.
- Node baseline at 07bec46: 10 tests passed. Solidity execution was blocked in the agent environment; no verified Forge result has been recorded here yet.
- Draft PR #1 adds the isolated comic vault room and five Node checks (15 total on that branch). Browser QA and integration remain outstanding.
- Project instruction/design files and separate Node/Foundry CI are being introduced. Actual workflow results must be checked; branch protections are not configured.

## Next milestones and acceptance gates
1. **Verify scenarios 1–3:** execute the existing Forge tests, preserve exact tool/config/output evidence, and inspect panic 0x11 plus final-state assertions. Do not claim the whole vault is secure.
2. **Review and integrate Ledger Lock:** reconcile real test actors with illustrated actors, reuse glossary/profile state, preserve notes, and complete desktop/mobile/keyboard playthrough. All three cases must distinguish illustrations from execution evidence.
3. **Add scenarios 4–6:** separate exploitable and fixed variants, test legitimate behavior plus exploit rejection, then add a blind transfer exercise. Record guidance/hints and independent reasoning separately.
4. **Extend the curriculum:** original storage-visibility, unexpected-balance and authorization rooms before compiler-sensitive arithmetic and advanced DeFi. Follow SOURCE_REGISTER.md; no wholesale challenge imports.
5. **Assess independent transfer:** reviewed explanations and unfamiliar tests before any competency claim. Accounts, cloud persistence and isolated execution need separate architecture work before public multi-user use.

## Guardrails
- Preserve existing web prototype behavior.
- Do not claim exploitability without passing local test evidence.
- Keep secrets server-side only; never commit credentials.
