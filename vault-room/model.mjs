// Hand-authored teaching states, NOT captured EVM execution evidence.
const step = (label, detail, vault, alice, bob, received, depth, line) => ({ label, detail, vault, alice, bob, received, depth, line });
const start = step('The vault is funded', 'Alice is a recipient contract credited with 1 ETH; Bob is credited with 2 ETH. These deposits happened before the withdrawal transaction.', 3, 1, 2, 0, 0, 0);
export const scenarios = [
  { id: 'normal', title: 'A routine request', subtitle: 'Case 01 · one withdrawal', request: 'Alice requests 1 ETH. Her receiving code does not call back.', outcome: 'success', verdict: 'The withdrawal succeeds and the ledger matches the transfer.', steps: [start,
    step('Check the ledger', '1 ETH of credit covers a 1 ETH request. The require condition passes.', 3, 1, 2, 0, 1, 1),
    step('Cross the boundary', 'The vault sends 1 ETH to Alice. The ledger has not changed yet. This is temporary transaction state.', 2, 1, 2, 1, 2, 2),
    step('Update the record', 'The external call returned true. The vault subtracts 1 ETH from Alice’s recorded credit.', 2, 0, 2, 1, 1, 4),
    step('Commit the transaction', 'The transaction succeeds. Bob is still owed 2 ETH, backed by the 2 ETH remaining in the vault.', 2, 0, 2, 1, 0, 4)] },
  { id: 'excess', title: 'More than her share', subtitle: 'Case 02 · insufficient credit', request: 'Alice requests 2 ETH even though her recorded credit is only 1 ETH.', outcome: 'guard', verdict: 'The balance check rejects the request before any transfer.', steps: [start,
    step('Check the ledger', 'The expression 1 >= 2 is false. require rejects the withdrawal.', 3, 1, 2, 0, 1, 1),
    step('Revert before transfer', 'No ETH is sent. The transaction fails and all balances stay at their starting values.', 3, 1, 2, 0, 0, 1)] },
  { id: 'reentrant', title: 'The double withdrawal', subtitle: 'Case 03 · nested call', request: 'Alice requests 1 ETH. Her receiving code calls withdraw(1 ether) again, exactly once, before returning.', outcome: 'panic', verdict: 'The outer subtraction underflows. This entire attempted withdrawal transaction reverts.', steps: [start,
    step('Outer check passes', 'Alice has 1 ETH recorded. The first request is allowed.', 3, 1, 2, 0, 1, 1),
    step('First temporary transfer', 'Alice receives 1 ETH, then calls back. Her ledger credit is still 1 ETH.', 2, 1, 2, 1, 2, 2),
    step('Inner check passes', 'The second withdrawal sees the same 1 ETH credit. The vault has enough liquidity to send again.', 2, 1, 2, 1, 3, 1),
    step('Second temporary transfer', 'Alice temporarily holds 2 ETH from the vault. This time her receive function returns without another callback.', 1, 1, 2, 2, 4, 2),
    step('Inner subtraction completes', 'The inner withdrawal reduces Alice’s recorded balance from 1 ETH to zero, then returns.', 1, 0, 2, 2, 3, 4),
    step('Outer subtraction panics', 'The outer withdrawal resumes and attempts 0 − 1 ETH. Solidity 0.8 checked arithmetic raises panic 0x11.', 1, 0, 2, 2, 1, 4),
    step('Rollback restores the vault', 'The withdrawal transaction reverts, undoing both transfers and its storage changes. Earlier deposits remain. Alice’s gas cost is outside this simplified model.', 3, 1, 2, 0, 0, 4)] }
];
export const glossary = [
  ['Invariant', 'A property required to hold at specified checkpoints. For this exercise, after a completed transaction the vault should cover all recorded credit. Writing the rule does not enforce it.'],
  ['balanceOf', 'A developer-chosen mapping name in SharedVault. It records credit owed to an address; it is not the actual ETH and is not a Solidity keyword.'],
  ['Actual balance', 'address(vault).balance is the ETH held by the vault. A ledger can be correct-looking while the real funds are insufficient.'],
  ['Reentrancy', 'A callback into a contract before an earlier call has finished. A reentrant path alone does not establish successful theft.'],
  ['Trust boundary', 'Where control or data crosses into code you do not control. The external call to the recipient is one such boundary.'],
  ['Revert', 'Rolls back changes within the failed call and its descendants. A caller may handle a failed low-level call; in this depicted path the outer withdrawal itself panics. Gas spent is not restored.'],
  ['Checked arithmetic', 'Solidity 0.8+ ordinary arithmetic rejects overflow or underflow. This subtraction is not inside an unchecked block.'],
  ['Execution trace', 'A record of actual execution events. This room shows a handcrafted illustrative sequence, not a captured Forge trace.'],
  ['msg.sender', 'The immediate caller in the current call frame. Here the withdrawing address is Alice’s contract, which must also be the address credited by the deposit.'],
  ['Evidence', 'An observed result tied to a reproducible setup. Predictions and teaching animations are not evidence that a Solidity test ran.']
];
export function ready(attempt) {
  return typeof attempt.prediction === 'string' && attempt.prediction.trim().length >= 20 && typeof attempt.invariant === 'string' && attempt.invariant.trim().length >= 20;
}
export function assess(scenario, attempt, index) {
  if (!ready(attempt)) return { ok: false, message: 'Write your prediction and invariant first (at least 20 characters each).' };
  if (index !== scenario.steps.length - 1) return { ok: false, message: 'Follow the walkthrough to its final state first.' };
  if (attempt.outcome !== scenario.outcome) return { ok: false, message: 'Revisit the last two steps. Which operation determines the final outcome?' };
  if (attempt.evidence !== 'illustration') return { ok: false, message: 'This walkthrough was authored for teaching. Has an actual Solidity test run been attached?' };
  if (typeof attempt.explanation !== 'string' || attempt.explanation.trim().length < 30) return { ok: false, message: 'Explain the cause and final balances in your own words (at least 30 characters).' };
  return { ok: true, message: 'Case walkthrough complete. Factual checks passed; your written explanation is saved for review, not graded. Solidity execution is still unverified.' };
}
export function loadProgress(storage) {
  try {
    const data = JSON.parse(storage.getItem('vault-room:v1') || '{}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return Object.fromEntries(scenarios.filter(s => data[s.id] && typeof data[s.id] === 'object').map(s => [s.id, data[s.id]]));
  } catch { return {}; }
}
