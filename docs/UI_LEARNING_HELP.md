# Learning cues and character palette

This increment updates the main dashboard in public/index.html and public/style.css. It does not integrate the separate vault room.

## Learner experience
- Start-here guide explains the learning sequence and where to run Forge.
- Expandable native details give plain definitions for prediction, invariant, evidence, trace explanation, local profiles and support levels. Click, tap or focus the summary and press Enter/Space.
- Action buttons have short native hover reminders. The expandable button guide repeats the instructions for touch and keyboard users; hover is not required.
- Definitions provide process guidance rather than scenario solutions, including in Independent mode.
- Existing attempts, storage keys, reveal checks and API behavior are unchanged. Save before switching scenarios or profiles.

## Visual tokens
Inspired by the supplied Hedra architect video and digital-key illustration. These are selected UI colors, not a claim of exact pixel extraction. No video, portrait or upload has been committed.

| Role | Color |
| --- | --- |
| Midnight navy canvas | #0a162d |
| Mint actions and learning cues | #69edc2 |
| Teal code accent | #35cbda |
| Gold focus and key details | #ffce70 |
| Coral status accent | #ff8091 |
| Main text | #edf6f8 |
| Secondary text | #b4c7d6 |

## Verification
Based on Copilot commit bad1f24524b4c5a12c78e0986f4d3ee6b5809d20, with this UI diff applied. Node v24.19.0. `npm test`: 10 passed, 0 failed. `git diff --check`: passed. Static checks cover unique IDs, label/description targets and sample text contrast. These are not visual verification.

Playwright launch was attempted but blocked because Chromium is absent. Desktop, narrow-screen, hover, keyboard and touch playthrough remain unverified.

Manual acceptance before merge:
1. Run npm start and open http://127.0.0.1:3000.
2. At desktop and 390px width, check readable labels, no page-wide overflow and usable source-code scrolling.
3. Tab from the skip link through the page. Open and close help with Enter/Space and check visible gold focus.
4. On touch, open every help section and the button guide. All guidance must be available without hover.
5. Save a draft, switch scenarios and return, then refresh. Confirm saved content and glossary bookmarks persist.
6. Check existing reveal/submission gates in Guided and Independent modes. UI descriptions do not bypass validation.

Solidity execution labels still come from the existing API. The newer CI evidence in foundry/lesson1/README.md does not automatically update those runtime labels; reconcile them as part of the planned integration.
