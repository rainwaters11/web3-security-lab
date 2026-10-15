# External curriculum source register

Review snapshot: 2026-10-15. Repository URLs alone do not imply permission to copy every file. Track individual file notices and dependencies before adaptation. No external contract code or artwork is copied by this documentation change.

| Source / pinned revision | Reviewed material | Reuse and verification status |
| --- | --- | --- |
| [rainwaters11/solidity-dojo](https://github.com/rainwaters11/solidity-dojo/tree/7061ed7b9d448d26dc4dc19f85498e64f9d66f16) | README, root LICENSE, ReentrancyVulnerable.sol and ReentrancySecure.sol | Root MIT, copyright 2026 kael; preserve notices for copied/adapted portions. Solidity ^0.8.26. No tests run here. |
| [secureum/secureum-a-maze-x-challenges](https://github.com/secureum/secureum-a-maze-x-challenges/tree/455187c437429cdb6974f7aabc5ab58640e73ace) | README, package/config, contracts N1–N5 and their test scaffolds | No root license in inspected tree. N1–N3 declare MIT; N4–N5 declare UNLICENSED. Review permissions per file; do not bulk import. Compilers 0.8.11 / 0.7.6. Tests contain learner TODOs; not executed here. README's sixth challenge is absent from inspected tree. |
| [secureum/DeFi-Security-Summit-Stanford](https://github.com/secureum/DeFi-Security-Summit-Stanford/tree/dfccd15c95e8315286afb5dc94f81db7e63a863a) | README and challenge contracts 0–3 | No root license in inspected tree; reviewed challenge sources declare UNLICENSED. Use references/original concept exercises unless applicable permission is established. Compiler 0.8.14; no tests executed here. README links to other repositories/branches for runnable variants. |

Dojo is a candidate for contrasting subtraction-based rollback with post-transfer zero assignment, then CEI/guard remediation. A-MAZE-X provides storage visibility, unexpected balances, arithmetic and authority concepts. Stanford provides approvals, delegatecall, exchange callbacks and oracle/solvency concepts. These are candidate curriculum mappings, not imported or validated lessons.

For each adopted source record: original author, exact path/revision, license text/notices, changes, compiler/EVM target, tests actually run, result, and reviewer. Revalidate old opcode assumptions and dependency APIs. Keep human learning objectives independent of external project names and visual branding.

Primary references for technical review:
- https://docs.soliditylang.org/
- https://getfoundry.sh/
- https://eips.ethereum.org/EIPS/eip-6780
