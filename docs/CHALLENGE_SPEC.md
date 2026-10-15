# Challenge authoring and review contract

Use this specification for every new scenario. It is a review standard; fields are not automatically enforced until a schema validator is implemented.

## Required record
| Field | Requirement |
| --- | --- |
| Identity | Stable lesson/scenario IDs, title, revision, support modes |
| Objective | One primary skill, prerequisites, relevant glossary IDs |
| Provenance | Original or adapted; exact source revision, license/notices, permitted reuse scope |
| Environment | Exact compiler, optimizer, EVM revision, runner version, dependencies |
| Setup | Actors, address ownership, funds, approvals, storage, timing, call sequence |
| Property | Invariant plus when it must hold: entry, exit, callbacks, or completed transaction |
| Prediction | Learner answer captured before outcome disclosure |
| Assistance | Ordered hints, reference explanation, learner/reference separation |
| Tests | Normal, hostile, and relevant boundary cases; explicit assertions and negative controls |
| Evidence | predicted / illustrative / learner-reported / executed; command, source revision, output, environment, reviewer |
| Finding | suspected / reproduced / remediated / rejected, with justification and limitations |
| Transfer | Changed scenario and delayed review concept |
| Completion | Factual checks separate from explanation review and independent competence |

## Reproduction requirements
- A test must reach the intended path. Confirm the credited address is the actual withdrawing actor.
- Assert a specific failure reason when it matters, not any revert. Assert actual funds, ledger credit, affected third parties, and recipient funds where relevant.
- Preserve prior deposits across the depicted withdrawal rollback. Distinguish a caught subcall revert from rollback of an entire top-level transaction. Gas cost is not refunded by a revert.
- Identify both the compiler and EVM rules: older compiler arithmetic and changed opcode semantics require explicit comparisons.
- A zero-balance assertion alone does not establish who received funds or why. A passing test demonstrates its asserted setup, not general security.
- Introduce a fixed variant explicitly and test legitimate use as well as attack rejection. Do not silently alter the baseline.
- Reference solutions must not appear in the initial learner path. Client-side hiding is pedagogical gating, not examination security.

## Current Lesson 1 reconciliation
At baseline 07bec46, the Foundry normal/excess tests use **Bob**: he withdraws 1 of his 2 ETH, or requests 3 ETH. Alice is the contract used for the once-reentrant scenario. The draft game PR illustrates Alice's non-reentrant 1 ETH withdrawal as a different setup. Both may teach the same concept, but do not label that animation a replay of Bob's test. Align setup or add a matching test before verified replay integration.

## Acceptance checklist
- [ ] Source and reuse status reviewed; no unapproved copying.
- [ ] Exact setup, compiler and EVM assumptions recorded.
- [ ] Learner prediction/invariant collected; hints and evidence types labeled.
- [ ] Intended Solidity paths executed with meaningful assertions, or explicitly blocked.
- [ ] Remediation preserves normal behavior (when a fixed variant exists).
- [ ] Browser/keyboard/narrow-screen flow checked; progress survives navigation/reload.
- [ ] Explanation review and independent transfer remain distinct from completion.
