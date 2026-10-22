# Agent workflow

Choose the applicable parts of this workflow for the requested task. It comes
from [michaelshimeles/skills](https://github.com/michaelshimeles/skills) and
uses the skills in `.agents/skills/`. Claude Code reads them through the
symlinks in `.claude/skills/`.

- Read-only reviews, explanations, and investigations need no worktree, commit,
  PR, or Greptile run. If an investigation leads to edits, isolate those edits.
- Code changes use isolation, relevant architecture guidance, checks, and
  evidence of the behavior changed. Capture a failure before fixing it.
- Small documentation edits use an isolated branch and relevant content or link
  checks. Do not manufacture runtime evidence or require a bot review for them.
- Ship when the task calls for a PR or a completed repository change. A request
  for a plan, review, or local experiment does not imply publishing it.

## This repo

This repo is Sketch, a native Rust infinite canvas built on wgpu, winit and
egui, plus its download page in `site/`, a single prerendered SvelteKit page
built for Vercel. The README covers building, running and testing the app, and
`site/README.md` covers the page and its image pipeline. The app used to be
called paper-rs. The GitHub repo is now `michaelshimeles/sketch`, but the
checkout folders keep the old name.

- Put worktrees in `../paper-rs-worktrees/<task-name>` on branches named
  `agent/<task-name>`. Outside the checkout, Cargo, Vite and svelte-check never
  pick them up.
- `/Users/Shared/projects/paper-rs` is synced to four other machines by
  Mutagen. Don't run `npm install` in its `site/`: about 110 MB of
  `node_modules` would sync to every machine unless the Mutagen session
  ignores it.
- Don't deploy to Vercel, create Vercel projects, publish GitHub releases or
  push tags. Micky decides when to ship.
- Sketch is a clean-room reimplementation modeled on Paper (paper.design).
  Never add Paper's code, shaders, icons, fonts or assets; `analysis/` records
  behavior only. On the download page, keep Paper's name out of the headline,
  logo and assets, don't imply affiliation, and keep Figma's name out of the
  headline too.
- Code ported from another project starts with a comment naming its source
  and gets an entry in `THIRD_PARTY.md`.
- Commit subjects follow the existing style: `feat(scope): …`,
  `fix(scope): …`, `docs: …`.
- The download page stays one fast page. Its only analytics is Vercel Web
  Analytics, which sets no cookies, collects no personal data and loads from
  the site's own domain. Add no other analytics, tracking or third-party
  requests; that is why the page bundles its font from
  `@fontsource-variable/inter`. Its feature copy names only features the app
  ships, and its system requirements line follows `Cargo.toml` and the README.

## Workflow

1. **Isolate.** Use `/new-feature` before repository edits. Start from
   `origin/main`, or preserve a worktree already assigned to this task.
   Never build on `main`.
2. **Build.** Use `/code-structure` when extracting shared operations or
   choosing boundaries. Follow the project's existing architecture; the
   service layer pattern is a default for projects without a convention.
3. **Prove.** Run relevant checks. Use `/evidence-driven-testing` for changed
   runtime behavior: record the failure before fixing it and the success
   afterward. For documentation, inspect the changed instructions and verify
   runnable examples and links as applicable.
4. **Ship.** Open the PR with evidence appropriate to the change. Use
   `/before-and-after` when screenshots help; use output pairs for CLI changes.
   Run `/greploop` for code or executable workflow changes, or when requested.
   Aim for **5/5 with zero unresolved actionable Greptile findings** on the
   current commit. Stop at the configured iteration cap, a review timeout, or
   an unavailable integration and report the actual score and remaining work.
   Do not claim success or raise the cap automatically. Present the PR URL.

Ship-beat notes:

- `/before-and-after` drives the `@vercel/before-and-after` CLI. `--markdown`
  uploads the pair and prints a PR-ready table; it also accepts existing
  PNGs, so evidence gathered while developing can be reused as-is.
- In containers/VMs where Chrome fails with "No usable sandbox", set
  `AGENT_BROWSER_ARGS="--no-sandbox"` for the capture command.
- The default upload host (0x0.st) is public — fine for ordinary UI shots;
  pass `--upload-url` for anything sensitive.

## Writing for humans

Run `/unslop` over anything a person will read, before you commit, post, or
send it: commit messages, the PR title and body, README and doc edits, code
comments, and the closing reply. It strips AI tells (em dashes, filler,
hedging, chatbot phrases, puffery, bold-label lists) and replaces fancy
words with plain ones and passive voice with active. Apply it to text you
wrote or changed, not to prose you didn't touch.

## Multi-agent rules

- Never commit directly to `main`.
- One worktree and one branch per task and per agent — never reuse or modify
  another agent's worktree, branch, or uncommitted work.
- **Scope check** before starting: skim open PRs' changed files
  (`gh pr list`, `gh pr diff <n> --name-only`) and look for uncommitted work
  in shared checkouts. Inspect overlapping diffs: independent edits to the same
  file may proceed in your own worktree. Ask only when changes conflict in
  behavior, depend on unfinished work, or ownership is unclear. Do not modify
  another task's checkout.
- Never force-push to `main` — and never plain `--force` anywhere; only
  `--force-with-lease`, only on your own task branch.
- Resolve lockfile conflicts by regenerating, never by hand-merging.
- Worktrees don't isolate shared resources: confirm a dev-server port
  answers *your* process before trusting it, and don't run schema
  experiments against a shared database.
- If a conflict can't be resolved confidently, stop and report instead of
  guessing.

## Completing a task that ships

1. Keep changes limited to the assigned task.
2. Run the applicable checks listed below.
3. Assemble applicable evidence into before/after pairs or content-check results.
4. Commit with a clear message, rebase onto the latest `origin/main`, and
   rerun the checks.
5. Push (`git push -u origin <branch>`; after rebasing an already-pushed
   branch, `--force-with-lease`).
6. Open the PR. The body must explain what changed, how it was tested (every
   claim backed by evidence), before/after proof, and any risks or follow-up
   work. Run the title and body through `/unslop` before posting.
7. Run `/greploop` when applicable, with the success and stopping conditions
   above. `/greploop-apps` selects the alternate trigger in that same workflow.
8. End by presenting the PR URL.

Do not merge the PR unless explicitly instructed. Keep the worktree until
the PR is merged or closed.

## Checks in this repo

For changes to the app:

- `cargo fmt --check` passes.
- `cargo clippy --all-targets -- -D warnings` passes.
- `cargo test` passes. The tests rewrite the screenshots in
  `docs/screenshots/`, and on a Mac most come out different from the
  committed ones. Unless the change is meant to update them, restore them with
  `git checkout -- docs/screenshots` before committing.

For changes to `site/`, run the npm commands in `site/`:

- `npm run check` reports 0 errors and 0 warnings.
- `npm run build` passes.
- Run the Svelte MCP `svelte-autofixer` on every changed `.svelte` file until it
  reports no issues.
- For changes to the page, look at it in a browser at 1440 px and 390 px wide,
  in light and dark, and click the theme toggle. Check for horizontal overflow
  and console errors. After `npm run build`, a running preview server serves
  the new HTML but returns 404 for the new hashed CSS and JS, so restart it.
- For changes to routes or `src/lib/site.ts`, run `npm run preview` and check
  that `curl -sI http://localhost:4173/download` returns a 302 to the release
  DMG with `cache-control: no-store`.
- Scripts generate the images in `site/static/`. Change their inputs in
  `site/scripts/` and rerun the scripts; don't edit the output by hand.
  `npm run shots` renders the app from this checkout, and `npm run images`
  reads the PNGs it writes to the gitignored `scripts/screenshots/out/`, so in
  a fresh worktree run `npm run shots` first.

For every change, `git diff --check` checks whitespace.

Keep generated evidence under the ignored `.artifacts/` directory.

## Skill sources

The skills were installed with:

```sh
npx skills add michaelshimeles/skills -s '*' -a cursor -a claude-code -a codex
```

`skills-lock.json` records the hash of each one, and `npx skills update -p`
updates them. Don't edit them here; change them upstream.

| Skill | Source |
|---|---|
| `new-feature`, `code-structure`, `evidence-driven-testing` | michaelshimeles/skills |
| `before-and-after` | michaelshimeles/skills, vendored from [vercel-labs/before-and-after](https://github.com/vercel-labs/before-and-after) |
| `greploop` | michaelshimeles/skills, vendored from [greptileai/skills](https://github.com/greptileai/skills) |
| `greploop-apps` | michaelshimeles/skills, compatibility entrypoint requiring `greploop` |
| `unslop` | michaelshimeles/skills, vendored from [cursor/plugins (pstack)](https://github.com/cursor/plugins/tree/main/pstack/skills/unslop) with frontmatter edited so agents apply it unprompted |
