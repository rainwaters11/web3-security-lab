# Game design: comic-style sleek vault escape room

Working product name: Web3 Security Lab. First room: The Ledger Lock.

Visual direction: midnight navy/charcoal, teal interactions, warm gold clues, graphic-novel framing, restrained halftones, readable selectable code. Use original or permission-cleared assets; never place necessary information only inside artwork.

Loop: inspect a case, identify assets/authority, predict, state a rule, step through behavior, attach evidence, explain the outcome. Doors unlock through relevant factual tasks; written reasoning remains reviewable rather than accepted solely because it is nonempty.

Three starting cases: normal withdrawal, excess withdrawal, once-reentrant withdrawal under checked arithmetic. Each has separate progress and explicit setup. Later add a genuinely exploitable separate variant, a repaired variant, and an unlabeled transfer exercise.

No countdown in Guided mode. Unlimited retries, optional clues, free glossary access. Track hint usage without shaming the learner. Cosmetic rewards may recognize participation; no badge implies professional audit competence.

Use step-controlled illustrations before real trace replay is implemented. Show temporary versus committed/rolled-back state and whether gas is omitted. Provide keyboard equivalents, accessible text, visible focus, adequate contrast, reduced motion, and sound off by default. Never require sound or drag-and-drop to solve a room.

Use the existing web app and browser APIs for the first room. A game engine, remote execution API, multiplayer, accounts, or payments requires a concrete feature need and architecture review; these are not prerequisites for the current milestone.
