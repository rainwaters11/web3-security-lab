# Copilot project instructions

Read and follow ../AGENTS.md (repository root AGENTS.md) as the shared coding and teaching agreement. Use README.md for executable setup instructions and ROADMAP.md for current priorities. This file supplements, rather than duplicates, the shared rules.

- We are co-building a smart-contract security learning game while the owner learns. Explain meaningful changes in clear steps; ask one question at each learning checkpoint.
- Before changing a lesson, read docs/CHALLENGE_SPEC.md and docs/LEARNING_DESIGN.md. For game changes read docs/GAME_DESIGN.md; for storage or APIs read docs/ARCHITECTURE.md.
- Check Codex PRs and current branch heads before starting overlapping work. The initial game work is in PR #1, codex/vault-trace-room. Treat that as a historical pointer and verify its current status.
- Keep original lesson behavior and progress intact when integrating the room. Reuse shared glossary and state modules instead of creating conflicting definitions or keys.
- Finish verification of scenarios 1–3 and the first playable room before expanding scenarios 4–6, unless the user explicitly changes priority.
- Report observed results separately from predictions and authored walkthroughs. Stop repeated installation retries after a concrete environment blocker; provide a reproducible local alternative.
- Do not treat repository instruction files as test enforcement. CI, targeted tests, and review must validate the implementation.
