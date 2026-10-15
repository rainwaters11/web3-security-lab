# LEARNING_LOG

## Session: 2026-10-15 (Kickoff)

### Reasoning practiced with guidance
- Worked through recorded credit versus actual funds, the repeated call, the outer subtraction from zero, and rollback with conversational guidance. The learner correctly answered follow-up questions; independent transfer has not yet been assessed.

### Hints used
- Platform hint usage was not recorded for that conversation. Explanations and prompts were provided by the tutor, so this must not be counted as a no-hint independent attempt.

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

### Concepts practiced; independent assessment pending
- Difference between reentrant call flow and reproduced theft.
- Difference between recorded balances (`balanceOf`) and actual contract ETH (`address(this).balance`).

### Attribution correction (2026-10-15)
The original kickoff entry overstated independent performance. This correction distinguishes guided practice from independent evidence without changing the predicted technical outcome. The user's screenshot confirms Forge 1.5.1 is installed on her laptop; no completed Solidity test output has been recorded in this log yet.

### Follow-up exercise
- Run scenario 1–3 commands locally and record exact pass/fail outputs and the real scenario-3 trace location of `Panic(0x11)`.
