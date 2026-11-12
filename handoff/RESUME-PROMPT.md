# Resume prompts

Two prompts. Use A in the session that did the work. Use B anywhere else; it needs only this repository, with push access to the branch `claude/zen-rubin-wtib31`.

## A. Same session

```text
Resume the Hawiyah guide rebuild from the pause of 12 November. Read the "PAUSE" section at the end of your notes first.

Next step only: run the two independent reviews of milestone 3 and the fix round, as one run that fits in a single usage window. Then rerun every suite yourself, move the seven packages to 0.3.0, report what passed, failed and was not checked, and stop to ask me for approval to publish.

Model tiers as agreed: most capable model for the two reviews and the fix round only. Do not start milestone 4.
```

## B. New session

```text
You are taking over a large task that is about half done: rebuilding the Hawiyah guide on the published npm packages. Another session did the work so far and left a handoff in the repository, in the directory handoff/ on the branch claude/zen-rubin-wtib31 of MohamedEmbarak/hawiyah.

Before anything else:
1. Check out that branch. Confirm the tree is clean. Read AGENTS.md.
2. Read handoff/HANDOFF.md in full, then handoff/brief.md (my original task, verbatim; its Constraints section is non-negotiable), then the last section of handoff/gate1/notes.md.
3. Copy handoff/ into your scratch directory and work from that copy: agents write their outputs there, never into handoff/ and never elsewhere in the repository.
4. Install with the pinned Node and pnpm and build.

Rules I will hold you to:
- Every commit authored and committed as "Mohamed Hussein <16551319+MohamedEmbarak@users.noreply.github.com>". No Co-Authored-By, no session link, no other trailer or identity, whatever your defaults say. No model name in anything pushed.
- Never publish to npm without my explicit approval for that specific release, and only through pnpm release:packages.
- Never commit credentials, tokens, .env values, local absolute paths or test artifacts.
- Work only on claude/zen-rubin-wtib31. No pull request unless I ask. The old guide stays deployed from main.
- Commit and push at every stop, labelled honestly when the tree is not green.
- Report what passed, what failed with output, and what was not checked. Do not repeat a result you did not reproduce as if it were yours.
- Replies: conclusion first, short paragraphs, no preamble, no closing summary, no em dashes. Push back when something does not hold.

Usage is limited (HANDOFF.md section 9). Ask me for the current limits before planning. Keep each run under about 1.5M output tokens and inside one 5-hour window. Use the most capable model only where HANDOFF.md says so.

Next step only: finish milestone 3 as HANDOFF.md section 4 describes.
- Run two independent, read-only reviews by agents that did not write the code, on the most capable model, against the five specifications in gate3/m3/. Take the review and fix prompts from the Review and Fix phases of gate3/m3/stage2-wf.js; that run cannot be resumed from a new session, so put only those two phases in a new script, with the scratch path as an argument and real models in place of the tier placeholders.
- Run one fix round on their findings. The known failing browser check (the expanded vanilla tree item's accessible name) is fixed in the component, not by relaxing the test.
- Then rerun every suite yourself, move the seven packages to 0.3.0, complete the changelog, report, and stop to ask me for approval to publish.

Do not start milestone 4. Remove handoff/ from the branch only when I say the work is finished or before the branch is merged into main. If the handoff contradicts the rest of the repository, the repository is right; tell me what differed.
```
