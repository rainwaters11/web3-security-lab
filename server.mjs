import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']]
]);

const sharedVaultSource = `// Training contract only. Never deploy with real funds.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SharedVault {
    mapping(address => uint256) public balanceOf;
    address public curator;

    constructor() { curator = msg.sender; }

    function deposit() external payable {
        balanceOf[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
        balanceOf[msg.sender] -= amount;
    }

    function changeCurator(address next) external {
        curator = next;
    }
}`;

const lesson = {
  id: 'lesson-1',
  title: 'Lesson 1 · Withdrawal behavior under external calls',
  objective: 'Distinguish reentrant control flow from successful theft, and use tests to confirm or reject claims.',
  supportLevels: ['guided', 'practice', 'independent'],
  scenarios: [
    {
      id: 's1-normal-withdrawal',
      order: 1,
      status: 'active',
      title: 'Normal withdrawal',
      summary: 'A user withdraws within recorded balance.',
      contractName: 'SharedVault',
      source: sharedVaultSource,
      localTest: 'forge test --match-test test_NormalWithdrawal_WithinBalance_Succeeds -vvv',
      expectedAssertions: [
        'Recorded balance decreases by withdrawal amount.',
        'Vault ETH decreases by withdrawal amount.',
        'Call does not revert.'
      ],
      hints: [
        'Identify precondition: the caller must have enough recorded balance.',
        'Track recorded balance and real ETH separately.',
        'Write assertions for both storage and actual ETH balance.'
      ],
      traceQuestion: 'Which line updates storage and which line transfers ETH in this successful path?',
      limitQuestion: 'What does one successful path not prove about adversarial callers?',
      outcome: {
        label: 'safe-behavior',
        status: 'reproduced',
        result: 'A normal withdrawal within balance succeeds and preserves accounting for this path.'
      }
    },
    {
      id: 's2-excess-withdrawal',
      order: 2,
      status: 'active',
      title: 'Excess withdrawal',
      summary: 'A user requests more than their recorded balance.',
      contractName: 'SharedVault',
      source: sharedVaultSource,
      localTest: 'forge test --match-test test_ExcessWithdrawal_RevertsAndStateUnchanged -vvv',
      expectedAssertions: [
        'Call reverts with insufficient-balance condition.',
        'Recorded balances remain unchanged.',
        'Vault ETH remains unchanged.'
      ],
      hints: [
        'The guard check runs before any external call.',
        'When a call reverts, state in reverted scope rolls back.',
        'Assert no storage mutation after revert.'
      ],
      traceQuestion: 'At what point does execution stop and why?',
      limitQuestion: 'What does this revert test not establish about reentrancy paths?',
      outcome: {
        label: 'safe-behavior',
        status: 'reproduced',
        result: 'Requesting above recorded balance reverts and leaves state unchanged.'
      }
    },
    {
      id: 's3-reentrant-attempt-reverts',
      order: 3,
      status: 'active',
      title: 'Reentrant withdrawal attempt (single reentry)',
      summary: 'Alice deposits 1 ETH, Bob deposits 2 ETH, Alice reenters once during withdraw.',
      contractName: 'SharedVault',
      source: sharedVaultSource,
      localTest: 'forge test --match-test test_ReentrantWithdrawal_AttemptRevertsAndStateRestored -vvvv',
      expectedAssertions: [
        'Attempted double withdrawal transaction reverts.',
        'Alice recorded balance stays 1 ETH.',
        'Bob recorded balance stays 2 ETH.',
        'Vault actual ETH stays 3 ETH.'
      ],
      hints: [
        'Reentrancy means control returned to attacker code before outer function finished.',
        'Under Solidity 0.8.x, arithmetic underflow reverts by default unless unchecked.',
        'A reverted top-level transaction rolls back vault storage and ETH transfers in that scope.'
      ],
      traceQuestion: 'Which nested call succeeds before the outer call reverts, and what rollback do you observe?',
      limitQuestion: 'Why does this failed theft attempt not prove the entire contract is secure?',
      outcome: {
        label: 'suspected-vuln-rejected-by-test',
        status: 'reproduced',
        result: 'The call path is reentrant, but this specific theft attempt reverts due to checked underflow in outer subtraction.'
      }
    },
    {
      id: 's4-exploitable-variant',
      order: 4,
      status: 'planned',
      title: 'Exploitable training variant',
      summary: 'Deliberately vulnerable variant where theft succeeds in local test.',
      contractName: 'SharedVaultExploitLab',
      source: '// Added in phase 2 after scenarios 1–3 are fully verified.',
      localTest: 'To be enabled in phase 2.',
      expectedAssertions: ['To be added in phase 2.'],
      hints: ['Phase 2 scenario.'],
      traceQuestion: 'Phase 2 scenario.',
      limitQuestion: 'Phase 2 scenario.',
      outcome: { label: 'planned', status: 'suspected', result: 'Planned for phase 2.' }
    },
    {
      id: 's5-remediated-variant',
      order: 5,
      status: 'planned',
      title: 'Remediated variant',
      summary: 'Accounting update before external call; attack fails while normal withdrawal still works.',
      contractName: 'SharedVaultFixed',
      source: '// Added in phase 2 after scenarios 1–3 are fully verified.',
      localTest: 'To be enabled in phase 2.',
      expectedAssertions: ['To be added in phase 2.'],
      hints: ['Phase 2 scenario.'],
      traceQuestion: 'Phase 2 scenario.',
      limitQuestion: 'Phase 2 scenario.',
      outcome: { label: 'planned', status: 'suspected', result: 'Planned for phase 2.' }
    },
    {
      id: 's6-blind-transfer',
      order: 6,
      status: 'planned',
      title: 'Blind transfer challenge',
      summary: 'Unfamiliar names and changed call structure, no vulnerability label or initial hints.',
      contractName: 'BlindTransferChallenge',
      source: '// Added in phase 2 after scenarios 1–3 are fully verified.',
      localTest: 'To be enabled in phase 2.',
      expectedAssertions: ['To be added in phase 2.'],
      hints: ['Phase 2 scenario.'],
      traceQuestion: 'Phase 2 scenario.',
      limitQuestion: 'Phase 2 scenario.',
      outcome: { label: 'planned', status: 'suspected', result: 'Planned for phase 2.' }
    }
  ]
};

const glossary = [
  { id: 'invariant', term: 'invariant', group: 'general', category: 'security-reasoning', definition: 'A rule that must remain true before and after relevant actions.', analogy: 'Like a safety rule that must hold at every checkpoint.', technicalMeaning: 'A required property over contract state transitions.', example: 'In SharedVault: a user should not spend the same recorded balance twice.', whyImportant: 'Findings become defensible when tied to violated invariants.', misunderstanding: 'Writing an invariant down does not enforce it automatically.', related: ['precondition', 'postcondition', 'solvency'] },
  { id: 'trust-boundary', term: 'trust boundary', group: 'general', category: 'security-reasoning', definition: 'A boundary where control or data crosses into code you do not control.', analogy: 'Passing your keys to someone else temporarily.', technicalMeaning: 'Execution crosses from trusted logic to potentially adversarial code.', example: 'In withdraw(), control leaves SharedVault at msg.sender.call{value: amount}("").', whyImportant: 'Many exploits happen at boundaries where assumptions break.', misunderstanding: 'External calls are not always unsafe, but they need careful state handling.', related: ['call', 'reentrancy', 'checks-effects-interactions'] },
  { id: 'authorization', term: 'authorization', group: 'general', category: 'security-reasoning', definition: 'Rules deciding who is allowed to perform an action.', analogy: 'A lock that only accepts certain keys.', technicalMeaning: 'Policy checks over caller identity/role for protected operations.', example: 'changeCurator() in SharedVault currently has no authorization check.', whyImportant: 'Missing authorization can let attackers change critical state.', misunderstanding: 'Authentication (who you are) is not the same as authorization (what you may do).', related: ['authentication', 'access control', 'msg.sender'] },
  { id: 'msg-sender', term: 'msg.sender', group: 'solidity-feature', category: 'reading-contract', definition: 'The immediate caller of the current function.', analogy: 'The person currently at the front desk window.', technicalMeaning: 'EVM context variable containing caller address for this call frame.', example: 'balanceOf[msg.sender] tracks credit for the current caller.', whyImportant: 'Authorization and accounting usually depend on caller identity.', misunderstanding: 'msg.sender can change across call frames during nested calls.', related: ['address', 'call', 'authentication'] },
  { id: 'msg-value', term: 'msg.value', group: 'solidity-feature', category: 'reading-contract', definition: 'Amount of wei sent with the call.', analogy: 'Cash handed over during a transaction.', technicalMeaning: 'EVM callvalue for the active message call frame.', example: 'deposit() adds msg.value to balanceOf[msg.sender].', whyImportant: 'Incorrect value handling can break accounting and solvency.', misunderstanding: 'msg.value is per-call, not a persistent user balance.', related: ['payable', 'wei', 'ETH'] },
  { id: 'require', term: 'require', group: 'solidity-feature', category: 'reading-contract', definition: 'Checks a condition and reverts if false.', analogy: 'A guard that denies entry when a rule is broken.', technicalMeaning: 'Conditional revert primitive with optional reason string.', example: 'require(balanceOf[msg.sender] >= amount, "Insufficient balance").', whyImportant: 'Guards are core to access control and safe state transitions.', misunderstanding: 'A require only protects the path where it is executed.', related: ['revert', 'precondition'] },
  { id: 'balanceof-name', term: 'balanceOf', group: 'developer-name', category: 'reading-contract', definition: 'A developer-chosen name, not a Solidity keyword.', analogy: 'A spreadsheet column label chosen by the author.', technicalMeaning: 'Mapping(address => uint256) storing contract-specific credits.', example: 'In SharedVault, balanceOf records user credit, not guaranteed wallet ETH.', whyImportant: 'Confusing recorded credit with actual funds causes analysis mistakes.', misunderstanding: 'balanceOf here is not the ERC-20 standard unless implemented as such.', related: ['mapping', 'solvency', 'address(this).balance'] },
  { id: 'curator-name', term: 'curator', group: 'developer-name', category: 'reading-contract', definition: 'A role variable name chosen by the contract author.', analogy: 'A job title written by the team.', technicalMeaning: 'Address state variable intended to represent an authority role.', example: 'SharedVault stores curator and allows updates via changeCurator().', whyImportant: 'Role variables matter only if permissions enforce them.', misunderstanding: 'Naming something admin-like does not enforce privilege checks.', related: ['authorization', 'access control'] },
  { id: 'withdraw-name', term: 'withdraw', group: 'developer-name', category: 'reading-contract', definition: 'A function name chosen by the developer.', analogy: 'A button label; behavior depends on implementation.', technicalMeaning: 'External function that sends ETH and updates internal accounting.', example: 'SharedVault.withdraw performs external call before decrementing balance.', whyImportant: 'Security properties depend on function order, not function names.', misunderstanding: 'A function named withdraw is not automatically safe or standard.', related: ['call', 'checks-effects-interactions', 'reentrancy'] },
  { id: 'reentrancy', term: 'reentrancy', group: 'general', category: 'security-reasoning', definition: 'A call pattern where external code re-enters a function before prior execution completes.', analogy: 'Re-entering a store checkout line before your first checkout is finalized.', technicalMeaning: 'Nested execution into vulnerable state-transition windows across call frames.', example: 'Attacker receive() calls vault.withdraw again before outer withdrawal subtracts balance.', whyImportant: 'Can break assumptions about one-time state updates.', misunderstanding: 'Reentrant call flow exists even when theft attempt ultimately reverts.', related: ['trust boundary', 'call stack', 'checks-effects-interactions'] },
  { id: 'checked-arithmetic', term: 'checked arithmetic', group: 'general', category: 'security-reasoning', definition: 'Default Solidity 0.8+ arithmetic behavior that reverts on overflow/underflow.', analogy: 'Calculator that refuses impossible negative stock counts.', technicalMeaning: 'Compiler-inserted overflow checks for arithmetic in checked context.', example: 'Outer balance subtraction can revert after inner subtraction already consumed balance.', whyImportant: 'Changes exploitability compared with older unchecked arithmetic defaults.', misunderstanding: 'Checked arithmetic does not remove all logic bugs or reentrancy risks.', related: ['underflow', 'unchecked arithmetic', 'compiler assumptions'] },
  { id: 'trace', term: 'execution trace', group: 'general', category: 'testing-evidence', definition: 'Step-by-step call and state flow recorded during execution.', analogy: 'A flight recorder for function calls.', technicalMeaning: 'Ordered call tree with op-level/context-level events and reverts.', example: 'Trace shows outer withdraw -> attacker receive -> inner withdraw -> outer underflow revert.', whyImportant: 'Supports evidence-based findings and helps reject false positives.', misunderstanding: 'A trace is evidence for that path, not proof of all-path behavior.', related: ['call stack', 'proof of concept', 'false positive'] },
  { id: 'false-positive', term: 'false positive', group: 'general', category: 'testing-evidence', definition: 'A suspected issue that tests/evidence fail to confirm.', analogy: 'A fire alarm triggered by steam, not fire.', technicalMeaning: 'Reported vulnerability claim not reproducible under correct assumptions.', example: 'Assuming any external call before update always yields theft in SharedVault.', whyImportant: 'Auditors must separate suspected from reproduced findings.', misunderstanding: 'False positive does not mean no risk exists anywhere else.', related: ['suspected finding', 'reproduced finding', 'invariant'] }
];

function scenarioById(id) {
  return lesson.scenarios.find(s => s.id === id);
}

function stripOutcomesForClient() {
  return {
    ...lesson,
    scenarios: lesson.scenarios.map(({ outcome, ...rest }) => rest),
    glossary
  };
}

function json(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data));
}

async function body(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 30000) throw new Error('Request too large');
  }
  return JSON.parse(raw || '{}');
}

function shortCoach(payload) {
  const prediction = String(payload.prediction || '').trim();
  const invariant = String(payload.invariant || '').trim();
  const evidence = String(payload.evidence || '').trim();
  const supportLevel = String(payload.supportLevel || 'guided');

  if (!prediction) return 'Start with a prediction: what do you think will happen and why?';
  if (!invariant) return 'Now state one invariant the scenario should preserve.';
  if (supportLevel === 'guided' && evidence.length < 15) return 'Good start. Add a concrete test path: caller, function order, expected revert/success, and balances.';
  if (supportLevel === 'practice' && evidence.length < 15) return 'Write the minimal assertions that would prove or disprove your claim.';
  if (supportLevel === 'independent' && evidence.length < 15) return 'Submit your evidence-focused test plan before requesting hints.';
  return 'Before revealing outcome, explain one thing this test does NOT establish about overall contract security.';
}

function buildReviewQueue(attempts) {
  const queue = [];
  for (const attempt of attempts) {
    if (!attempt || !attempt.scenarioId) continue;
    const scenario = scenarioById(attempt.scenarioId);
    if (!scenario) continue;
    if ((attempt.outcomeStatus || '') !== 'reproduced') {
      queue.push({ type: 'scenario-repeat', scenarioId: scenario.id, prompt: `Retry ${scenario.title} in a different support mode and rewrite invariant in your own words.` });
    }
    if ((attempt.explanation || '').trim().length < 20) {
      queue.push({ type: 'explanation-gap', scenarioId: scenario.id, prompt: `Explain ${scenario.title}: why did the trace support or reject your claim?` });
    }
  }
  if (!queue.length) {
    queue.push({ type: 'maintenance', scenarioId: 's3-reentrant-attempt-reverts', prompt: 'Revisit scenario 3 next session and explain why reentrancy in control flow did not equal successful theft in this setup.' });
  }
  return queue.slice(0, 6);
}

export const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;

    if (req.method === 'GET' && path === '/api/lesson/1') {
      return json(res, 200, stripOutcomesForClient());
    }

    if (req.method === 'POST' && path === '/api/reveal') {
      const data = await body(req);
      const scenario = scenarioById(String(data.scenarioId || ''));
      if (!scenario) return json(res, 404, { error: 'Scenario not found.' });
      if (scenario.status !== 'active') return json(res, 400, { error: 'This scenario is not active yet. Finish scenarios 1–3 first.' });

      const prediction = String(data.prediction || '').trim();
      const invariant = String(data.invariant || '').trim();
      if (prediction.length < 20 || invariant.length < 20) {
        return json(res, 400, { error: 'Write both prediction and invariant (at least 20 characters each) before revealing outcome.' });
      }

      return json(res, 200, {
        scenarioId: scenario.id,
        outcomeStatus: scenario.outcome.status,
        outcomeLabel: scenario.outcome.label,
        outcome: scenario.outcome.result,
        expectedAssertions: scenario.expectedAssertions,
        traceQuestion: scenario.traceQuestion,
        limitQuestion: scenario.limitQuestion,
        reminder: 'Do not generalize from one test. Track suspected vs reproduced vs remediated findings separately.'
      });
    }

    if (req.method === 'POST' && path === '/api/coach') {
      const data = await body(req);
      return json(res, 200, { mode: 'guided', reply: shortCoach(data) });
    }

    if (req.method === 'POST' && path === '/api/review-queue') {
      const data = await body(req);
      const attempts = Array.isArray(data.attempts) ? data.attempts : [];
      return json(res, 200, { queue: buildReviewQueue(attempts) });
    }

    if (req.method === 'GET' && path === '/api/challenge') {
      const scenario = scenarioById('s3-reentrant-attempt-reverts');
      return json(res, 200, {
        id: scenario.id,
        title: scenario.title,
        scenario: scenario.summary,
        source: scenario.source,
        prompts: ['Provide prediction first.', 'State an invariant before reveal.', 'Write evidence and explain trace.'],
        hints: scenario.hints
      });
    }

    if (req.method === 'GET' && files.has(path)) {
      const [name, mime] = files.get(path);
      const content = await readFile(join(root, 'public', name));
      res.writeHead(200, {
        'content-type': mime,
        'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'",
        'x-content-type-options': 'nosniff'
      });
      return res.end(content);
    }

    json(res, 404, { error: 'Not found' });
  } catch (err) {
    json(res, err.message === 'Request too large' ? 413 : 400, { error: 'Invalid request' });
  }
});

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  server.listen(port, '127.0.0.1', () => console.log(`Web3 Security Lab at http://127.0.0.1:${port}`));
}
