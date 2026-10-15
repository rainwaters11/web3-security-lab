# Lesson 1 (local Foundry scenarios 1–3)

This phase keeps `SharedVault` unchanged and verifies:

1. Normal withdrawal succeeds within recorded balance.
2. Excess withdrawal reverts and leaves state unchanged.
3. Single-reentry withdrawal attempt reverts; balances and vault ETH remain unchanged.

## Focused run commands

From `/home/runner/work/web3-security-lab/web3-security-lab/foundry`:

- `forge test --match-test test_NormalWithdrawal_WithinBalance_Succeeds -vvv`
- `forge test --match-test test_ExcessWithdrawal_RevertsAndStateUnchanged -vvv`
- `forge test --match-test test_ReentrantWithdrawal_AttemptRevertsAndStateRestored -vvvv`

## Scope note

A reverting reentrant attempt does **not** prove the whole contract is secure.
It only establishes behavior for this specific setup and call path.
