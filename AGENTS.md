# AGENTS.md — nyaridev

Guide for AI agents (Claude Code, Cursor, Codex…) working in this repo. In Claude Code, the workspace and category
rules load from the `CLAUDE.md` files above this folder; this file covers only what's specific here.

## What this is

Nari's GitHub profile page. GitHub shows this repo's `README.md` on the `nyaridev` profile, so the repo is public and
holds only the page and its pictures.

## Commands

| Command | What |
|---|---|
| `node generate.mjs` | Draws every picture, writes `README.md` again and checks the result |

## Layout

| Path | What |
|---|---|
| `README.md` | The page: the name panel, then one linked panel per project. Generated |
| `assets/hero-{dark,light}.svg` | The name panel, picked with `prefers-color-scheme`. Generated |
| `assets/cards/<project>-{dark,light}.svg` | One panel per project. Generated |
| `generate.mjs` | Draws all of it; the project list is in it |

## Rules

- Never edit the pictures or `README.md` by hand: change `generate.mjs` and run it.
- Black and white ink only, in the style of the profile picture: panels, focus lines, screentone, rough inked edges.
  No color, no mascots, nothing cute, nothing that moves. The generator's check fails on a color or an animation.
- Only public repos get a panel: a link to a private repo is a dead link for visitors.
- A project's mark and wordmark come from that project's own banner, drawn in one ink.
- Everything here is public. Private brand sources stay out of this folder.
