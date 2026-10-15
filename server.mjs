import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);

const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/lessonState.mjs', ['lessonState.mjs', 'text/javascript; charset=utf-8']],
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

const glossary = [
  { id: 'invariant', term: 'invariant', group: 'general', category: 'security-reasoning', definition: 'A rule that must remain true before and after relevant actions.', analogy: 'Like a safety rule that must hold at every checkpoint.', technicalMeaning: 'A required property over contract state transitions.', example: 'A user should not spend the same recorded balance twice.', whyImportant: 'Findings are defendable when tied to violated invariants.', misunderstanding: 'Writing an invariant does not enforce it automatically.', related: ['precondition', 'postcondition', 'solvency'] },
  { id: 'trust-boundary', term: 'trust boundary', group: 'general', category: 'security-reasoning', definition: 'Where control/data crosses into code you do not control.', analogy: 'Handing keys to someone else briefly.', technicalMeaning: 'Execution crossing trusted to potentially adversarial logic.', example: 'withdraw() hands control to msg.sender.call.', whyImportant: 'Many exploits happen where assumptions cross boundaries.', misunderstanding: 'External calls can be safe if state transitions are robust.', related: ['call', 'reentrancy'] },
  { id: 'authorization', term: 'authorization', group: 'general', category: 'security-reasoning', definition: 'Rules deciding who may perform an action.', analogy: 'A lock accepting only approved keys.', technicalMeaning: 'Policy checks over caller identity/role.', example: 'changeCurator() has no authorization check.', whyImportant: 'Missing checks can expose critical state.', misunderstanding: 'Authentication is not authorization.', related: ['access control', 'msg.sender'] },
  { id: 'msg-sender', term: 'msg.sender', group: 'solidity-feature', category: 'reading-contract', definition: 'Immediate caller for the current call frame.', analogy: 'Current person at the service counter.', technicalMeaning: 'EVM context caller address.', example: 'balanceOf[msg.sender] indexes credit by caller.', whyImportant: 'Permission and accounting checks depend on caller identity.', misunderstanding: 'msg.sender can differ across nested calls.', related: ['call', 'authentication'] },
  { id: 'msg-value', term: 'msg.value', group: 'solidity-feature', category: 'reading-contract', definition: 'Wei sent with current call.', analogy: 'Cash sent with a request.', technicalMeaning: 'EVM callvalue for the current frame.', example: 'deposit() records msg.value credit.', whyImportant: 'Incorrect value handling breaks solvency assumptions.', misunderstanding: 'msg.value is per-call, not persistent balance.', related: ['payable', 'wei'] },
  { id: 'require', term: 'require', group: 'solidity-feature', category: 'reading-contract', definition: 'Condition guard that reverts if false.', analogy: 'Gate that denies invalid entry.', technicalMeaning: 'Conditional revert primitive with optional reason.', example: 'require(balanceOf[msg.sender] >= amount, "Insufficient balance").', whyImportant: 'Guards protect state transitions.', misunderstanding: 'A require protects only where executed.', related: ['revert', 'precondition'] },
  { id: 'balanceof-name', term: 'balanceOf', group: 'developer-name', category: 'reading-contract', definition: 'Developer-chosen name, not a Solidity keyword.', analogy: 'Spreadsheet column label chosen by author.', technicalMeaning: 'Mapping(address => uint256) for contract-specific credits.', example: 'In SharedVault balanceOf is internal credit, not guaranteed wallet ETH.', whyImportant: 'Credit and real ETH are different quantities.', misunderstanding: 'balanceOf here is not automatically ERC-20 behavior.', related: ['mapping', 'address(this).balance'] },
  { id: 'curator-name', term: 'curator', group: 'developer-name', category: 'reading-contract', definition: 'Role variable name chosen by developer.', analogy: 'A role title in an org chart.', technicalMeaning: 'Address variable intended to represent role authority.', example: 'SharedVault sets curator in constructor and allows changeCurator.', whyImportant: 'Role names matter only if authorization enforces them.', misunderstanding: 'Naming a role does not enforce permission.', related: ['authorization', 'access control'] },
  { id: 'withdraw-name', term: 'withdraw', group: 'developer-name', category: 'reading-contract', definition: 'Developer-chosen function name.', analogy: 'Button text; behavior depends on implementation.', technicalMeaning: 'Function sending ETH and mutating accounting state.', example: 'SharedVault.withdraw external-calls before balance decrement.', whyImportant: 'Security depends on code path, not naming.', misunderstanding: 'A function named withdraw is not automatically safe.', related: ['call', 'checks-effects-interactions'] },
  { id: 'reentrancy', term: 'reentrancy', group: 'general', category: 'security-reasoning', definition: 'External code re-enters before prior execution finishes.', analogy: 'Rejoining checkout before first purchase is finalized.', technicalMeaning: 'Nested call flow exploiting in-progress state assumptions.', example: 'receive() calls withdraw again before outer withdraw completes.', whyImportant: 'Can violate one-time accounting assumptions.', misunderstanding: 'Reentrant flow can exist even when final transaction reverts.', related: ['trust boundary', 'call stack'] },
  { id: 'checked-arithmetic', term: 'checked arithmetic', group: 'general', category: 'security-reasoning', definition: 'Solidity 0.8+ default arithmetic reverts on overflow/underflow.', analogy: 'Counter that rejects negative inventory.', technicalMeaning: 'Compiler-inserted arithmetic safety checks in checked context.', example: 'Outer subtraction can panic after inner subtraction.', whyImportant: 'Exploitability differs from older unchecked defaults.', misunderstanding: 'Checked arithmetic does not eliminate all logic bugs.', related: ['underflow', 'unchecked arithmetic'] },
  { id: 'trace', term: 'execution trace', group: 'general', category: 'testing-evidence', definition: 'Stepwise record of call flow and failures/successes.', analogy: 'Flight recorder for execution.', technicalMeaning: 'Ordered call tree and revert/success events.', example: 'Shows outer withdraw -> receive -> inner withdraw -> panic.', whyImportant: 'Supports evidence-based findings and false-positive rejection.', misunderstanding: 'One trace proves one path, not all paths.', related: ['call stack', 'proof of concept'] },
  { id: 'false-positive', term: 'false positive', group: 'general', category: 'testing-evidence', definition: 'A suspected issue not confirmed by valid reproduction.', analogy: 'Alarm triggered by steam instead of fire.', technicalMeaning: 'Claim lacking reproducible evidence under correct assumptions.', example: 'Assuming all external-call-before-update patterns always steal funds.', whyImportant: 'Auditors must separate suspected from reproduced findings.', misunderstanding: 'Rejecting one claim does not prove total safety.', related: ['suspected finding', 'reproduced finding'] }
];

const lesson = {
  id: 'lesson-1',
  title: 'Lesson 1 · Withdrawal behavior under external calls',
  objective: 'Use predictions, invariants, and tests to distinguish risky control flow from reproduced theft.',
  deploymentMode: 'local-single-user',
  deploymentModeNote: 'This build is intended for local single-user learning. Browser localStorage is device/browser-profile scoped.',
  supportLevels: ['guided', 'practice', 'independent'],
  solidityExecution: {
    status: 'BLOCKED / NOT YET VERIFIED',
    reason: 'Foundry/solc execution is blocked in this environment; scenario outcomes are expected/predicted until local Forge run evidence is provided.'
  },
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
        'Identify the precondition: sufficient recorded balance.',
        'Track recorded credit and real ETH separately.',
        'Assert both storage and vault ETH outcomes.'
      ],
      traceQuestion: 'Which call frame performs the ETH transfer and which frame updates balanceOf?',
      limitQuestion: 'What does one successful benign path not establish about adversarial paths?',
      outcome: {
        label: 'expected-safe-path',
        status: 'not-yet-verified',
        result: 'Expected: normal within-balance withdrawal succeeds with matching accounting updates.'
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
        'Call reverts with "Insufficient balance" guard.',
        'Recorded balances remain unchanged.',
        'Vault ETH remains unchanged.'
      ],
      hints: [
        'The require guard runs before external interaction.',
        'A revert should roll back writes in reverted scope.',
        'Check both users and vault balance post-revert.'
      ],
      traceQuestion: 'Where does execution stop in this path and which side-effects are prevented?',
      limitQuestion: 'Why does this guard-path test not prove reentrancy safety?',
      outcome: {
        label: 'expected-safe-path',
        status: 'not-yet-verified',
        result: 'Expected: excess withdrawal reverts and state remains unchanged.'
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
        'Attempted double withdrawal transaction reverts with arithmetic panic 0x11.',
        'Alice recorded balance remains 1 ETH.',
        'Bob recorded balance remains 2 ETH.',
        'Vault actual ETH remains 3 ETH.'
      ],
      hints: [
        'Reentrancy means control returns to attacker code before outer function completes.',
        'Solidity 0.8.x uses checked arithmetic by default (without unchecked blocks).',
        'A reverted top-level transaction rolls back storage and ETH movement in that scope.'
      ],
      traceQuestion: 'If you run a real trace, where does Panic(0x11) occur and what gets rolled back?',
      limitQuestion: 'Why does a failed theft attempt not prove full-contract security?',
      outcome: {
        label: 'expected-revert-path',
        status: 'not-yet-verified',
        result: 'Predicted: reentrant call flow occurs, but transaction reverts from checked underflow in outer subtraction.'
      }
    },
    {
      id: 's4-exploitable-variant',
      order: 4,
      status: 'planned',
      title: 'Exploitable training variant',
      summary: 'Deliberately vulnerable variant where theft succeeds in local test.',
      contractName: 'SharedVaultExploitLab',
      source: '// Planned for phase 2 after scenarios 1–3 are fully verified locally.',
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
      source: '// Planned for phase 2 after scenarios 1–3 are fully verified locally.',
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
      summary: 'Unfamiliar names and changed call structure, without vulnerability label or initial hints.',
      contractName: 'BlindTransferChallenge',
      source: '// Planned for phase 2 after scenarios 1–3 are fully verified locally.',
      localTest: 'To be enabled in phase 2.',
      expectedAssertions: ['To be added in phase 2.'],
      hints: ['Phase 2 scenario.'],
      traceQuestion: 'Phase 2 scenario.',
      limitQuestion: 'Phase 2 scenario.',
      outcome: { label: 'planned', status: 'suspected', result: 'Planned for phase 2.' }
    }
  ],
  glossary
};

function scenarioById(id) {
  return lesson.scenarios.find(s => s.id === id);
}

function stripOutcomesForClient() {
  return {
    ...lesson,
    scenarios: lesson.scenarios.map(({ outcome, ...rest }) => rest)
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

  if (!prediction) return 'Start with a prediction: what do you think happens and why?';
  if (!invariant) return 'Now write one invariant that should remain true.';
  if (supportLevel === 'independent' && evidence.length < 20) return 'Independent mode: submit your evidence plan before requesting outcome.';
  if (evidence.length < 20) return 'Add concrete evidence: caller, call sequence, expected assertions, and what would falsify your claim.';
  return 'Before reveal, state one limitation: what this single test cannot establish.';
}

function buildReviewQueue(attempts) {
  const queue = [];
  for (const attempt of attempts) {
    if (!attempt?.scenarioId) continue;
    const scenario = scenarioById(attempt.scenarioId);
    if (!scenario) continue;

    if (!attempt.submittedAt && attempt.supportLevel === 'independent') {
      queue.push({ type: 'submission-missing', scenarioId: scenario.id, prompt: `Submit your ${scenario.title} attempt before requesting hidden outcome.` });
    }
    if ((attempt.outcomeStatus || '') !== 'reproduced') {
      queue.push({ type: 'resurface', scenarioId: scenario.id, prompt: `Revisit ${scenario.title} and re-test with explicit invariant assertions.` });
    }
    if (String(attempt.explanation || '').trim().length < 20) {
      queue.push({ type: 'explain', scenarioId: scenario.id, prompt: `Explain the execution trace for ${scenario.title} in your own words.` });
    }
  }

  if (!queue.length) {
    queue.push({ type: 'maintenance', scenarioId: 's3-reentrant-attempt-reverts', prompt: 'Revisit scenario 3 later with a real forge trace and identify where panic 0x11 is emitted.' });
  }
  return queue.slice(0, 8);
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
      const supportLevel = String(data.supportLevel || 'guided').trim();
      const submitted = data.submitted === true;

      if (prediction.length < 20 || invariant.length < 20) {
        return json(res, 400, { error: 'Write both prediction and invariant (at least 20 characters each) before revealing outcome.' });
      }
      if (supportLevel === 'independent' && !submitted) {
        return json(res, 400, { error: 'Independent mode keeps outcomes hidden until you submit your attempt.' });
      }

      return json(res, 200, {
        scenarioId: scenario.id,
        outcomeStatus: scenario.outcome.status,
        outcomeLabel: scenario.outcome.label,
        outcome: scenario.outcome.result,
        expectedAssertions: scenario.expectedAssertions,
        traceQuestion: scenario.traceQuestion,
        limitQuestion: scenario.limitQuestion,
        solidityExecutionStatus: lesson.solidityExecution.status,
        reminder: 'Do not generalize from one test path. Keep suspected, reproduced, and remediated findings separate.'
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
        prompts: ['Write prediction first.', 'Write invariant before reveal.', 'Explain what your test does and does not establish.'],
        hints: scenario.hints,
        solidityExecutionStatus: lesson.solidityExecution.status
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
