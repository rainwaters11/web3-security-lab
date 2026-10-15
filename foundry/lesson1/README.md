# Lesson 1 (local Foundry scenarios 1–3)

This phase keeps `SharedVault` unchanged and verifies:

1. Normal withdrawal succeeds within recorded balance.
2. Excess withdrawal reverts with `Insufficient balance` and leaves state unchanged.
3. Single-reentry withdrawal attempt is expected to panic with arithmetic code `0x11`; balances and vault ETH should remain unchanged after revert.

## Solidity execution status

**BLOCKED / NOT YET VERIFIED** in this cloud environment.

Reason: `forge` is unavailable and network restrictions blocked Foundry/solc bootstrap in this runner.
Until local Forge execution is run and trace evidence is captured, outcomes above remain predicted expectations, not observed results.

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
