# Lesson 1 (local Foundry scenarios 1–3)

This phase keeps `SharedVault` unchanged and verifies:

1. Normal withdrawal succeeds within recorded balance.
2. Excess withdrawal reverts with `Insufficient balance` and leaves state unchanged.
3. Single-reentry withdrawal attempt is expected to panic with arithmetic code `0x11`; balances and vault ETH should remain unchanged after revert.

## Solidity execution status

**PARTIALLY VERIFIED BY CI EVIDENCE** and **still blocked in this local cloud workspace**.

- Historical blocker (this workspace): `forge` unavailable here and bootstrap attempts were previously blocked by DNS/network policy.
- New observed execution evidence: GitHub Actions run `38824220847` completed the Foundry suite successfully on PR #2 infrastructure.
- Important boundary: these checks verify three specific paths; they do **not** prove whole-contract security.

## Verified CI evidence (GitHub Actions)

- Run: https://github.com/rainwaters11/web3-security-lab/actions/runs/38824220847
- Workflow: `Project checks` (`.github/workflows/ci.yml`) on PR #2 (`codex/project-standards`)
- Tested checkout SHA (merge ref): `c7afa2a8a6e2242f0eaefba45aa2b4f52578211c`
- PR head SHA referenced by run: `37a14625280511be08de3954af017bb3a9bd8450`
- Solidity job URL: https://github.com/rainwaters11/web3-security-lab/actions/runs/38824220847/job/116727752054

### Toolchain and config captured in logs

- Forge: `1.5.1-v1.5.1` (commit `b0a9dd9ceda36f63e2326ce530c10e6916f4b8a2`)
- Compilation line: `Compiling 2 files with Solc 0.8.20`
- Foundry config in job output includes:
  - `src = "src"`
  - `test = "test"`
  - `out = "out"`
  - `solc = "0.8.20"`
  - `optimizer = true`
  - `optimizer_runs = 200`

### Scenario test results from the run

- `[PASS] test_NormalWithdrawal_WithinBalance_Succeeds()`
- `[PASS] test_ExcessWithdrawal_RevertsAndStateUnchanged()`
- `[PASS] test_ReentrantWithdrawal_AttemptRevertsAndStateRestored()`
- Suite summary in logs: `3 passed; 0 failed; 0 skipped`.

### Reentrant-path details confirmed in traces

- Trace includes: `panic: arithmetic underflow or overflow (0x11)` on the reverting outer path.
- Post-revert static calls in the same trace return:
  - `balanceOf(ReenterOnceAttacker) -> 1e18`
  - `balanceOf(UserActor) -> 2e18`
- The test source also asserts `address(vault).balance == 3 ether` after the revert.
- Interpretation: the failing withdrawal call rolls back its own effects; earlier deposits remain intact.

## Important interpretation notes

- Passing these three scenario paths does **not** establish total contract security.
- Room animations/walkthroughs are authored teaching illustrations, not captured Forge traces.
- Actor difference is intentional and documented:
  - Foundry normal/excess tests execute withdrawals through **Bob (`UserActor`)**.
  - Room illustrations narrate normal/excess requests using **Alice** for pedagogy.
  - These are not identical execution scripts and must not be described as identical evidence.
- Local limitation remains: Forge is still unavailable in this current cloud workspace even though GitHub Actions executed the suite.

## Run commands locally (from your own checkout)

```bash
forge --version
```

```bash
cd foundry
forge config | rg "solc_version"
```

```bash
forge test --match-test test_NormalWithdrawal_WithinBalance_Succeeds -vvv
forge test --match-test test_ExcessWithdrawal_RevertsAndStateUnchanged -vvv
forge test --match-test test_ReentrantWithdrawal_AttemptRevertsAndStateRestored -vvvv
```

## Scope note

A reverting reentrant attempt does **not** prove overall contract security.
It establishes behavior only for this specific setup and call path.
