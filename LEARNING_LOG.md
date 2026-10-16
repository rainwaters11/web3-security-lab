# LEARNING_LOG

## Session: 2026-10-15 (Kickoff)

### What you identified independently
- Predicted that in `SharedVault`, a single reentry attempt can occur but the full transaction may still revert when the outer subtraction underflows under Solidity checked arithmetic.

### Hints used
- No scenario hint consumed yet in this run; prediction was provided directly.

### Invariant and test evidence
- Invariant: A transaction that reverts must not leave mutated recorded balances or reduced vault ETH for this setup.

### Predicted outcome (not observed evidence)
- Alice (attacker contract) deposits 1 ETH so `balanceOf[address(alice)] == 1 ether`.
- Bob deposits 2 ETH so `balanceOf[address(bob)] == 2 ether`.
- Vault starts at 3 ETH.
- Alice receive() reenters exactly once.
- Prediction: transaction panics on arithmetic underflow in the outer subtraction and reverts.

### Observed evidence in this environment
- Solidity execution status: **BLOCKED / NOT YET VERIFIED**.
- Attempted checks:
  - `forge --version` -> `/bin/bash: forge: command not found`
- Prior install attempts were blocked by DNS/network restrictions to Foundry/Solidity binary hosts in this runner.
- No real Forge trace was produced in this environment, so no on-chain execution trace is claimed here.

### Command(s) for your local machine (to produce observed evidence)
- `forge --version`
- `cd foundry`
- `forge config | rg "solc_version"`
- `forge test --match-test test_NormalWithdrawal_WithinBalance_Succeeds -vvv`
- `forge test --match-test test_ExcessWithdrawal_RevertsAndStateUnchanged -vvv`
- `forge test --match-test test_ReentrantWithdrawal_AttemptRevertsAndStateRestored -vvvv`

### False positives and corrections
- Reentrant control flow alone is not equivalent to successful theft.
- Predicted behavior must stay labeled predicted until local test/trace evidence confirms it.

### What you can explain without assistance
- Difference between reentrant call flow and reproduced theft.
- Difference between recorded balances (`balanceOf`) and actual contract ETH (`address(this).balance`).

### Follow-up exercise
- Run scenario 1–3 commands locally and record exact pass/fail outputs and the real scenario-3 trace location of `Panic(0x11)`.

## Session: 2026-10-15 (CI verification update)

### Historical context preserved
- Earlier entries above remain accurate historical records of this workspace limitation: Forge execution was blocked locally in this environment.

### New observed evidence (GitHub Actions)
- Verified run: https://github.com/rainwaters11/web3-security-lab/actions/runs/38824220847
- Solidity job logs: https://github.com/rainwaters11/web3-security-lab/actions/runs/38824220847/job/116727752054
- Node job logs (same run): https://github.com/rainwaters11/web3-security-lab/actions/runs/38824220847/job/116727752339
- Tested checkout SHA in run logs: `c7afa2a8a6e2242f0eaefba45aa2b4f52578211c`
- PR head SHA associated with that run: `37a14625280511be08de3954af017bb3a9bd8450`
- Forge in logs: `forge Version: 1.5.1-v1.5.1` (commit `b0a9dd9ceda36f63e2326ce530c10e6916f4b8a2`)
- Solc in logs: `Compiling 2 files with Solc 0.8.20`
- Relevant config in logs: `src="src"`, `test="test"`, `out="out"`, `solc="0.8.20"`, `optimizer=true`, `optimizer_runs=200`.

### Scenario 1–3 results (actual)
- `[PASS] test_NormalWithdrawal_WithinBalance_Succeeds()`
- `[PASS] test_ExcessWithdrawal_RevertsAndStateUnchanged()`
- `[PASS] test_ReentrantWithdrawal_AttemptRevertsAndStateRestored()`
- Suite summary: `3 passed; 0 failed; 0 skipped`.

### Reentrant scenario evidence (actual trace details)
- Logs show the reentrant path ending with `panic: arithmetic underflow or overflow (0x11)`.
- Post-revert static-call values in the same trace:
  - `balanceOf(ReenterOnceAttacker) = 1e18`
  - `balanceOf(UserActor) = 2e18`
- Test source additionally asserts vault ETH remains `3 ether` after the reverted attempt.

### Distinctions (must remain explicit)
1. These three paths passed; this does **not** prove whole-contract security.
2. Forge is still unavailable in this local cloud workspace, but GitHub Actions executed the tests successfully.
3. Room animations are authored illustrations, not captured Forge traces.
4. Foundry normal/excess tests use Bob (`UserActor`) withdrawals, while room illustrations narrate normal/excess using Alice; they are not identical execution evidence.
5. The failing withdrawal call rolls back its own changes; earlier deposits remain intact.
