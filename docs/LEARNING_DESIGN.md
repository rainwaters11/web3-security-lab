# Learning design

## Outcomes
A learner should be able to read unfamiliar contract code, map assets/actors/authority, write a contextual invariant, predict a call path, design a discriminating test, interpret a trace, evaluate impact, and validate remediation. Independent transfer to new code is the assessment target.

## Lesson loop
1. Brief: establish the system, prerequisites, compiler assumptions, and legitimate user goal.
2. Predict: learner states an expected outcome and why before viewing the answer.
3. Model: identify assets, actors, trust boundaries, and an invariant with its observation checkpoints.
4. Investigate: write or complete a test. Give hints progressively; record which were used.
5. Observe: execute in the designated local environment. Distinguish expected results, observed results, and illustrative explanations.
6. Explain: ask one teach-back question about the cause, final state, and limits of the evidence.
7. Repair: test the protection AND legitimate behavior after a fix.
8. Transfer: present an unfamiliar variant later without naming the vulnerability.

## Support and assessment
Guided mode teaches vocabulary and reasoning; Practice reduces support; Independent hides solution-specific assistance until submission. Definitions remain available and are not vulnerability hints. Learners may change support level, but record the level for the attempt rather than relabeling guided work independent.

Track factual checks, invariant quality, evidence quality, explanation review, hints, and transfer results separately. Completion indicates participation. Independent competency requires a reviewed explanation and successful application to a different case; do not automatically call a learner an expert. AI assessment remains provisional and must cite the relevant code/test facts.

## Review queue
Resurface missed concepts in later sessions using changed actors, values, or code structure. Track why the item is queued and the attempt that triggered it. Preserve prior attempts rather than silently replacing the history. This behavior must be verified against the actual implementation before claiming adaptive learning is complete.

## Writing and privacy
Use plain language followed by precise terminology. Identify developer-chosen names (balanceOf) separately from Solidity features (msg.sender) and security concepts (invariant). Avoid teaching that any external call proves a vulnerability or that private storage is secret. Store personal learning notes privately; project-level logs contain only authorized summaries and test evidence.
