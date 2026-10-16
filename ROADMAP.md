# ROADMAP

## Current state (2026-10-15)
- Repository root currently contains only `README.md`, `LICENSE`, and `web3-security-lab-starter.zip`.
- The runnable prototype code (Node server + UI + tests) exists inside the zip and is not yet materialized as normal repository files.

## First small build milestone
1. Materialize the starter app from `web3-security-lab-starter.zip` into tracked source files.
2. Verify baseline behavior with `npm test` and local server run.
3. Add one reproducible Foundry exercise package for `SharedVault`:
   - vulnerable training contract
   - explicit security property (invariant)
   - learner test scaffold with TODO checkpoints
   - separate reference solution not shown in learner path
   - fixed contract and regression tests
   - short lesson on assumptions, exploitability conditions, and limits
4. Label findings as suspected/reproduced/remediated with command evidence.

## Guardrails
- Preserve existing web prototype behavior.
- Do not claim exploitability without passing local test evidence.
- Keep secrets server-side only; never commit credentials.
