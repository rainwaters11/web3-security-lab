# LEARNING_LOG

## Session: 2026-10-15 (Kickoff)

### What you identified independently
- Predicted that in `SharedVault`, a single reentry attempt can occur but the full transaction may still revert when the outer subtraction underflows under Solidity checked arithmetic.

### Hints used
- No scenario hint consumed yet in this run; prediction was provided directly.

### Invariant and test evidence
- Invariant: A transaction that reverts must not leave mutated recorded balances or reduced vault ETH for this scenario setup.
- Prediction (from user):
  - Alice deposits 1 ETH and reenters once during `withdraw(1 ether)`.
  - Bob deposits 2 ETH.
  - Inner withdrawal reduces Alice recorded balance to zero.
  - Outer subtraction then underflows and reverts.
- Intended command (focused trace):
  - `cd /home/runner/work/web3-security-lab/web3-security-lab/foundry && forge test --match-test test_ReentrantWithdrawal_AttemptRevertsAndStateRestored -vvvv`
- Observed result in this environment: **blocked** (tooling unavailable).
  - `forge --version` -> `forge: command not found`
  - Foundry bootstrap script fetch failed due DNS resolution (`foundry.paradigm.xyz`).
  - Source install attempt failed when build script tried to fetch Solidity release index (`https://binaries.soliditylang.org/linux-amd64/list.json`) and DNS resolution failed.
- Limitation: Because Forge could not run in this sandbox, no local Foundry trace was produced yet. Scenario 3 assertions are implemented in test code but pending execution in an environment with Forge + network access to required release metadata.

### False positives and corrections
- Reentrant control flow alone is not equivalent to successful theft.
- This scenario is designed to test and potentially reject a theft claim under the current compiler arithmetic behavior and exact call sequence.

### What you can explain without assistance
- Difference between a reentrant call path and a reproduced theft.
- Difference between recorded balances (`balanceOf`) and vault real ETH balance (`address(this).balance`).

### Follow-up exercise
- Run the focused Forge test in a network-enabled local environment and walk through the full trace line by line, then compare with an intentionally exploitable variant in Lesson 1 scenario 4.
