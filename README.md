# Web3 Security Lab

A working smart-contract security learning prototype. Predict behavior, investigate code, inspect evidence, and explain what a test actually establishes. The final product name is undecided; the game direction is a comic-style vault escape room.

## Run the learning app

Requires Node.js 20 or later. The current app has no npm dependencies to install.

```sh
npm start
```

Open http://127.0.0.1:3000. Notes, bookmarks and review items are stored in this browser under learner-scoped keys. This is a local single-user prototype, not an authenticated multi-user service. Export important notes and do not commit private learner content.

```sh
npm test
```

These are application tests, not Solidity security verification.

## Run the Solidity exercises

Install Foundry separately if needed. CI is configured for Forge v1.5.1 and the project pins Solidity 0.8.20. No third-party Foundry libraries are needed by the current exercises.

```sh
forge --version
cd foundry
forge test -vvvv
```

For one scenario:

```sh
forge test --match-test test_ReentrantWithdrawal_AttemptRevertsAndStateRestored -vvvv
```

Record the actual result before claiming verification. In the current tests Bob performs the normal/excess requests; Alice is the once-reentrant contract. A passing test covers its asserted path, not the entire vault's security.

## Game and AI status

The isolated Ledger Lock room is proposed in [draft PR #1](https://github.com/rainwaters11/web3-security-lab/pull/1); check its current branch/merge status. It is not included on all branches. On a branch containing vault-room/, start it with `node vault-room/server.mjs` and open http://127.0.0.1:3001.

The mentor can optionally use a server-side OPENAI_API_KEY; never put a key in frontend code or Git. Inspect the current server configuration before enabling it. Core practice does not require paid AI. AI feedback and authored game walkthroughs are not executed test evidence.

## Project guidance

- [Agent agreement](AGENTS.md) and [Copilot instructions](.github/copilot-instructions.md)
- [Roadmap](ROADMAP.md) and [project learning log](LEARNING_LOG.md)
- [Learning design](docs/LEARNING_DESIGN.md), [challenge specification](docs/CHALLENGE_SPEC.md), and [game design](docs/GAME_DESIGN.md)
- [Architecture](docs/ARCHITECTURE.md) and [source register](docs/SOURCE_REGISTER.md)

CI has separate Node and Solidity jobs. Check actual GitHub Actions results; the existence of the workflow does not establish a pass. Browser playthrough remains a separate check. Branch-protection requirements have not been configured by this change.
