# FreshCut (Recall) — Project Memory

## Snapshot (2026-07-11 — pre-migration cleanup session)
- **What:** New-client memory app for stylists — remember details about people you just met at the salon
- **Status:** ✅ Finished — live, in active use, no open issues
- **Live URL:** https://freshcutrecall.netlify.app (Netlify project: freshcutrecall)
- **GitHub:** https://github.com/emprestriedge/FreshCut (public, last commit 2026-03-20)
- **Local folder:** VibeCoding/FreshCut — current working copy. (README's `ClaudeCowork/FreshCutRecall/` reference is a stale pre-April-2026 path — ignore.)

## Folder structure
- Root: index.html / app.js / style.css + referenced images (skull-bg.jpg, icons)
- `Deploy/` — the live Netlify drop
- `DigitalAssets/` — art and masters
- `capacitor.config.json` — iOS wrap candidate if desired later

## Where we left off
Clean, finished build. No pending work. iOS wrap is a someday-maybe.

## Design refresh (2026-09-29 — built on branch design-refresh-2026-09-29, DRAFT deployed, prod awaiting Erin)
- Purpose: FreshCut is a demo piece on the PFD website; function stays as-is, visual polish only.
- Background: **Teal Plaster** (`DigitalAssets/images/green-texture-bg copy.jpg`) chosen over Brown Marble and Purple Haze, darkened 27%.
- Main form card: see-through at **67% opacity** (was 85%), no blur, so the texture shows. Purple input boxes stay solid.
- Style: **neumorphic** (chosen over flat and solid-slab neumorphic). Fields pressed in, buttons raised, light from top left; Yes/No keep teal/plum fills.
- Client cards: also see-through at 67%, neumorphic rim, Apple-premium hairline outline — 0.5pt gradient, ~32% white at top-left fading to ~5% (full white, then 45%, were too sharp; client cards only); avatars raised.
- Small gray text (tagline, "N people saved", client preview line, dates): **pale antique gold #C8BD93** — chosen. (Rejected: powder pink #D69ABA; also tried deep mauve, antique #B3A574, deep #978A5C.) Tagline + count keep a soft dark text-shadow halo.
- Clients page: **Raised cards** chosen (glass client cards float with neu shadows, avatars pressed in like the selected Yes toggle, teal search/export icons, export button raised). Panel option rejected.
- Date sits in a pressed-in dark-purple well on each client card (chosen over name-in-well).
- Card opacity: confirmed 67.
- **New feature (the only functional change):** keyword search + date picker on Clients page.
  - Search matches name, phone, hair, talked-about, pets, kids. Multi-word = all words must appear, any order. Matched words highlighted teal; preview shows the matching field ("Pets · Cocker spaniel…") on 2 lines.
  - Calendar icon at end of search box opens a neumorphic month calendar; teal dots mark days with entries; picking a day shows entries added OR edited that day; "Clear date" link. Search + date combine.
  - Found existing bug: current search matches every client with a phone number for any non-number query (empty digit string always "includes"). Fixed in the new search.
  - Date match = added OR edited (confirmed).
- Fields (Erin's list): Name, Phone Number, Location (new), Hair Type / Clipper Guard, Conversation, Any Pets? (What kind?), Any Kids? (How many?), Notes (new, last).
- Pop-up: solid (opaque) light purple with dark-purple fields pressed in; hairline outline on every card.
- Hair Type / Clipper Guard replaced by **Occupation** (her 2nd question; not hair-specific for the PFD demo). Hair details → Notes.
- 4 sample clients seed on first launch only (empty devices), for demo screenshots; she'll delete them.
- Draft (current): https://6abbb12ae698bc5fa55824cf--freshcutrecall.netlify.app — status card: ~/Cowork/Claude/projects/freshcut.md
- Mockup: claude.ai artifact "FreshCut Backgrounds".
