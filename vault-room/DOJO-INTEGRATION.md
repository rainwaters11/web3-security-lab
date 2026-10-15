# Solidity Dojo: reviewed source and curriculum plan

Reviewed fork: https://github.com/rainwaters11/solidity-dojo

Pinned revision: `7061ed7b9d448d26dc4dc19f85498e64f9d66f16`.

Upstream identified by GitHub: https://github.com/KaelSensei/solidity-dojo

The fork is a useful contract-and-test curriculum source, not a ready-made game engine. Its root LICENSE is MIT, copyright (c) 2026 kael. Preserve the license and applicable attribution when copying/adapting code; review source-level and dependency notices too. This change copies no Dojo code or artwork.

## Source files actually reviewed

- [README](https://github.com/rainwaters11/solidity-dojo/blob/7061ed7b9d448d26dc4dc19f85498e64f9d66f16/README.md): training material organized into basics, applications, DeFi, hacks, and EVM. Its coverage/test counts are author claims, not independently validated here.
- [License](https://github.com/rainwaters11/solidity-dojo/blob/7061ed7b9d448d26dc4dc19f85498e64f9d66f16/LICENSE).
- [ReentrancyVulnerable.sol](https://github.com/rainwaters11/solidity-dojo/blob/7061ed7b9d448d26dc4dc19f85498e64f9d66f16/src/hacks/ReentrancyVulnerable.sol): Solidity ^0.8.26, caches user credit, external-calls, then assigns zero. Unlike SharedVault's repeated subtraction, repeated zero assignments do not cause arithmetic underflow. This is a candidate for scenario 4, subject to actual reproduction with fixed funding and call limits.
- [ReentrancySecure.sol](https://github.com/rainwaters11/solidity-dojo/blob/7061ed7b9d448d26dc4dc19f85498e64f9d66f16/src/hacks/ReentrancySecure.sol): primary withdraw function applies a lock and zeros credit before the external call. Candidate scenario 5 must test both hostile callbacks and legitimate withdrawals. Its alternative transfer function is not a blanket recommendation that a gas stipend solves reentrancy.

## Candidate future rooms (paths observed, contents not reviewed yet)

| Room idea | Source candidate | Teaching objective |
| --- | --- | --- |
| The Identity Switch | src/hacks/TxOriginAttack.sol | Immediate caller versus transaction origin |
| The Echo Signature | src/hacks/SignatureReplay.sol | Why an authorization may be reused |
| The Locked Exit | src/hacks/DoSAttack.sol | Progress and blocked withdrawals |
| The Borrowed Storage | src/hacks/DelegatecallAttack.sol | Execution context and storage authority |
| The Price Illusion | src/hacks/OracleManipulation.sol | Price sources and economic assumptions |

Before adding any candidate: inspect its contract and test, review its prerequisites and license notices, run a focused local test, record actual evidence, then create a learner version without premature solution disclosure. A filename is not proof of correctness.

## Integration boundaries

Keep the fork separate. Do not import its entire dependency tree or execute it inside the web server. Existing SharedVault pins solc 0.8.20 while the reviewed Dojo reentrancy files require ^0.8.26: use a separate training configuration or a deliberate compiler migration, not a silent pragma edit. Preserve pinned source references so lessons remain reproducible even if the fork changes.
