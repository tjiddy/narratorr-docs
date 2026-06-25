# narratorr docs — audit work-list

_Two-way docs↔code reconciliation: 27 pages, 131 findings. Source of truth: narratorr `main` @ 2026-06-02. Docs last touched 2026-03-18 (~924 commits stale)._

## ⏳ RESUME / PROGRESS (read this first)

We are **mid-overhaul** of the narratorr docs (separate repo: `C:\Users\Todd\Code\narratorr-docs`, Astro Starlight; NO automate pipeline — manual). Strategy: worst-first, cross-cutting sweeps + per-page fixes.

**DONE:**
- ✅ **Recycling Bin (P0)** — fully exorcised: page `guides/recycling-bin.mdx` deleted; removed from `astro.config.mjs` sidebar; all 3 inbound refs cleaned (`index.mdx` splash card, `settings.mdx` `Recycle Retention` row, `features.mdx` `deleted`-event description). The "guides/recycling-bin.mdx" entry in the work-list below is now OBSOLETE.
- ✅ **GitHub link** fixed in `astro.config.mjs` (`todd` → `tjiddy`).
- (Edits are written to disk but UNCOMMITTED in narratorr-docs.)

**NEXT:** 25 content pages remain (11 P0). Execution method was being decided — **Option A** = throttled parallel rewrite workflow (one agent per page, fed that page's findings from THIS file, surgical fixes preserving voice, then human diff-review; throttle batches of 3 to avoid 429s) vs **Option B** = hand-write. Leaning **A**. Also surfaced: a real **code bug** to file separately — audio `outputFormat`/`mergeBehavior` settings appear **inert** (callers hardcode `m4b`/`always`).

**To resume after a compact:** re-read this whole file — the prioritized work-list + per-page detailed findings (with code evidence + fixes) below are the complete battle plan.

## Overview

The docs are structurally complete but have drifted hard from the current app — roughly half the pages carry actively-wrong claims, not just stale phrasing. The dominant failure modes are (1) phantom features documented as real (a whole "Recycling Bin" page, "Monitor for Upgrades", a UI-driven Prowlarr "import/preview/apply" flow, editable Weight Multipliers, the LIBRARY_PATH env var), (2) the settings UI reorg that invalidated nearly every "Settings > X" nav path (no Library/Import/Processing/Network/RSS/Tagging tabs exist; they're sections inside General/Search/System/Post-Processing), and (3) major shipped features that are entirely undocumented (6 of 9 notifier types, the redesigned MAM freeleech wedge, Hardcover metadata, the Filtering settings section, TRUSTED_PROXIES). A handful of items are outright harmful (FlareSolverr /v1 doubling, inverted seed-time-blocks-import claim). The reference tables that are accurate (quality tiers, naming tokens, backup mechanics) are the exception, not the rule.

## Flagship gaps (must-fix for 1.0)

1. Phantom Recycling Bin feature: an entire guide page + a Settings 'Recycle Retention' row + a dead /guides/recycling-bin/ link document soft-delete/restore that does not exist in code (deletes are hard rm). Page must be deleted, settings row replaced with the real 'Series Cache Retention'.
2. Prowlarr integration is documented backwards everywhere it appears (first-run, indexers, features): docs describe a pull-based in-app 'Prowlarr Import/Sync' with Preview/Apply buttons that don't exist. The real model is push-based — you add narratorr to Prowlarr as a Readarr app and Prowlarr syncs indexers in. A client test explicitly asserts no Prowlarr button/modal renders.
3. MyAnonamouse (the primary audiobook tracker) is missing from the first-run indexer list and its redesigned freeleech-wedge setting (Never/Prefer, server-side &fl flag) is undocumented in indexers.mdx — the old 3-option Never/Preferred/Required + wedge-reserve model is gone.
4. Notifications page documents only 3 of 9 notifier types — Email, Telegram, Slack, Pushover, ntfy, Gotify are entirely absent — plus wrong webhook header format (JSON not Key:Value) and wrong template-variable scope.
5. Auth ships OFF by default (mode: 'none') — the single most important first-run security fact, flagged with a red warning in the in-app WelcomeModal — is never stated in first-run docs; auth is instead framed as a wizard choice.
6. Hardcover metadata (API key setting + Series card population + health check) shipped but is undocumented in settings.mdx and features.mdx.
7. Discovery now defaults to ENABLED but multiple pages (settings, discovery guide) frame it as off-by-default; the Snooze action was retired but is still documented as a primary card action/lifecycle state.
8. Audio processing is documented as an automatic import-time pipeline with a master 'Enabled' toggle, but processing is manual-only (per-book Merge / bulk Convert) with no enable toggle, and the documented Output Format/Merge Behavior settings are inert (callers hardcode m4b/always).
9. LIBRARY_PATH env var was removed (#623) and is decorative, yet it is presented as the canonical way to set the library root in env-vars, library, and installation docs; meanwhile the security-relevant TRUSTED_PROXIES env var (reverse-proxy hardening, #1174) is missing from env-vars and security docs.
10. Settings UI reorganization broke navigation paths site-wide: there is no Library/Import/Processing/Network/RSS/Tagging tab — these are sections inside General, Search, System, or Post Processing. Nearly every 'Settings > X' breadcrumb in the docs is wrong.

## Prioritized work-list

### P0 — 11 pages

#### `guides/recycling-bin.mdx` — _rewrite_
> Entire page documents a soft-delete/restore feature that does not exist; deletes are hard rm with no bin, restore, retention, or System page.
- [ ] Delete the page entirely (recommended) — grep for 'recycl' returns zero source hits
- [ ] If a deletion guide is kept, rewrite to the real flow: DELETE /api/books/:id with optional 'Also delete files from disk' checkbox (DeleteBookModal), permanent, cancels active downloads
- [ ] Remove all phantom claims: snapshot-for-restore, Recycle Retention Days setting, System > Recycling Bin page, Restore/Purge/Empty All actions, restore behaviors
- [ ] Find and remove every inbound link to /guides/recycling-bin/ (settings.mdx and index.mdx splash both reference recycling bin)

#### `configuration/settings.mdx` — _major-update_
> Documents the nonexistent Recycle Retention + dead link, several wrong defaults, and omits entire shipped settings areas (Metadata Hardcover, Filtering).
- [ ] Replace 'Recycle Retention' row with 'Series Cache Retention' (default 30); remove /guides/recycling-bin/ link
- [ ] Fix defaults: Min Seeders is 1 (not 0); Discovery defaults on (not off); Reject Words ships with a default word list
- [ ] Move Max Concurrent (Processing, labeled 'Max Concurrent Jobs'), Protocol Preference (Search), Reject/Required Words (Filtering) to correct sections
- [ ] Add missing: Hardcover API Key, a Filtering section (Languages, Min Duration), Min/Max Download Size, Min Seed Ratio, Redownload Failed, Search Priority, naming Separator/Case
- [ ] Remove phantom Processing 'Enabled' toggle and non-editable Weight Multipliers; note Tagging is nested as 'Tag Embedding' under Post Processing

#### `configuration/notifications.mdx` — _add-sections_
> Only 3 of 9 notifier types documented; wrong webhook header format and template-variable scope.
- [ ] Add sections for Email, Telegram, Slack, Pushover, ntfy, Gotify with their per-type fields from NOTIFIER_REGISTRY
- [ ] Fix Headers: JSON object format (not one-per-line Key: Value)
- [ ] Fix template variables: substituted only in the Body Template field, not URL/headers; document the Body Template field itself
- [ ] Add on_health_issue event to the events table (+ Discord dark-orange embed color) and {book.coverUrl}/health.* tokens
- [ ] Fix Script section: field is 'Script Path', timeout is configurable (default 30s, max 300), UI label 'Custom Script'

#### `getting-started/first-run.mdx` — _major-update_
> Wrong nav for library, omits MAM, Prowlarr backwards, and never states auth ships OFF by default.
- [ ] Lead step 1 with: auth is OFF by default (mode 'none') on fresh installs — enabling it (Forms recommended) is the user's first action; mirror the WelcomeModal red warning
- [ ] Fix 'Settings > Library' to 'Settings > General' for library path
- [ ] Add MyAnonamouse to the indexer-type list (mam_id + freeleech-wedge)
- [ ] Reframe Prowlarr: not an in-app import — add narratorr to Prowlarr as a Readarr app and Prowlarr pushes indexers in
- [ ] Add reliability caveat to AudioBookBay (Cloudflare-gated, often needs FlareSolverr, unreliable)

#### `configuration/indexers.mdx` — _major-update_
> Fictional pull-based Prowlarr Import flow and a materially incomplete MAM section.
- [ ] Rewrite Prowlarr section to the push model (narratorr as a Readarr app in Prowlarr; no in-app button/preview/Import); reword both Prowlarr tips
- [ ] Add MAM Freeleech Wedge row (Never/Prefer; Prefer appends server-side &fl at download time)
- [ ] Add MAM Base URL (optional, custom mirror) and note the account auto-detection card (username/class/VIP/wedges/exit IP)
- [ ] Document the 'Route through proxy' (useProxy) toggle present on all four indexer types

#### `guides/audio-processing.mdx` — _rewrite_
> Describes automatic import-time processing with a master toggle; reality is manual-only with inert format/behavior settings.
- [ ] Remove the phantom 'Enabled' master toggle; processing is gated only by ffmpeg path being set
- [ ] Rewrite 'How It Works': no automatic import-time processing — manual per-book Merge (>=2 files required) or bulk Convert, post-import
- [ ] Flag Output Format and Merge Behavior as currently inert (callers hardcode m4b/always); document or file the engineering gap
- [ ] Fix 'Keep Original Bitrate': still re-encodes (AAC/MP3), just drops the bitrate cap; not lossless
- [ ] Rename 'Settings > Processing' to 'Settings > Post Processing'; add Max Concurrent Jobs, Post-Processing Script + timeout, Tag Embedding

#### `guides/quality-gates.mdx` — _major-update_
> Phantom 'Monitor for Upgrades' setting, wrong held-download button model, and settings scattered across four UI sections.
- [ ] Delete the 'Monitor for Upgrades' row (no such field anywhere)
- [ ] Fix held-download review: three buttons (Approve / Reject / Reject & Search); plain Reject does NOT blacklist; file deletion only when Delete After Import is on
- [ ] Split the single 'Settings > Quality' table to reflect Quality/Filtering/Search/New-Book sections
- [ ] Fix Min Seeders default (1), Reject Words default list, add Min/Max Download Size; correct pipeline (ebook-only, min/max-size gates, blacklist by hash OR guid)
- [ ] Add missing hold reasons imported_book_replacement and unhandled_error; note first-download auto-import (no quality comparison)

#### `troubleshooting.mdx` — _major-update_
> Two actively harmful claims: FlareSolverr /v1 doubling and inverted seed-time-blocks-import.
- [ ] Fix FlareSolverr URL guidance to the bare base (http://flaresolverr:8191, no /v1 — app appends it)
- [ ] Fix the inverted seed-time claim: min seed time gates torrent REMOVAL after import (only with Delete After Import on), never blocks import
- [ ] Fix nav: ffmpeg under 'Post Processing'; log level under 'System' (Logging section); Library/Import are sub-sections of 'General'

#### `configuration/network.mdx` — _major-update_
> Wrong proxy scope (claims metadata/all-outbound) and omits the per-indexer toggle that actually gates it.
- [ ] Restrict 'What Gets Proxied' to indexer search/test only; remove metadata-lookup and 'any outbound request' claims
- [ ] Document the per-indexer 'Route through proxy' (useProxy) toggle — the global URL is inert until an indexer opts in
- [ ] Fix 'Settings > Network' to 'Settings > General' (Network section)
- [ ] Reframe FlareSolverr as a separate Cloudflare-bypass field, not a 'proxy override'

#### `configuration/environment-variables.mdx` — _major-update_
> Phantom LIBRARY_PATH presented as canonical; missing TRUSTED_PROXIES (security), LOG_LEVEL, MONITOR_INTERVAL_CRON.
- [ ] Remove LIBRARY_PATH row entirely (removed #623, decorative); note library root is a Settings value mounted at /audiobooks
- [ ] Add TRUSTED_PROXIES (security-relevant reverse-proxy var, #1174), LOG_LEVEL, MONITOR_INTERVAL_CRON, mirroring README
- [ ] Fix DATABASE_URL: 'file:' prefix is optional (stripped if present), not required
- [ ] Add PUID/PGID (linuxserver.io base, default 911) to Docker overrides/compose

#### `configuration/library.mdx` — _major-update_
> Built on the removed LIBRARY_PATH env var and a nonexistent manual-install default; wrong nav.
- [ ] Remove the LIBRARY_PATH override bullet; library path is a DB setting (Settings > General > Library), /audiobooks is the single default for all installs
- [ ] Drop the fabricated './audiobooks' manual-install default
- [ ] Fix nav: Folder/File Format live in 'File Naming' (General page), not 'Settings > Library'; Import/Processing → 'General > Import' / 'Post Processing'
- [ ] Add Separator/Case/Preset naming controls

### P1 — 4 pages

#### `guides/discovery.mdx` — _major-update_
> Retired Snooze action still documented; phantom editable Weight Multipliers; wrong expiry and default-on framing.
- [ ] Remove Snooze from actions table, settings, and lifecycle (retired Wave 11.2 #755 — route returns 404)
- [ ] Rewrite Weight Multipliers as auto-computed from dismissals, not user-editable; remove the 'Settings > Discovery > Weight Multipliers' / set-to-0 instructions
- [ ] Fix expiry: measured from createdAt (refresh doesn't reset it), so refreshed suggestions still expire
- [ ] Reframe 'enabling' — discovery defaults ON; clarify Add opens a popover with optional 'Search immediately'

#### `guides/features.mdx` — _major-update_
> Fictional UI-driven Prowlarr Sync, a removed event type, and missing events/health checks.
- [ ] Rewrite Prowlarr Sync to the Readarr-compat push model (no Preview/Apply UI exists)
- [ ] Remove the 'upgraded' event row (removed from schema, test asserts rejection)
- [ ] Add missing events: merge_started/merged/merge_failed, wrong_release, book_added, metadata_fixed, grab_failed
- [ ] Add the Hardcover health check; reframe Dismissed Update Version as auto-managed state, not an editable field

#### `guides/rss-feeds.mdx` — _major-update_
> Wrong nav (no Settings > RSS) and a phantom 'monitor for upgrades' upgrade path.
- [ ] Fix location to Settings > Search > 'RSS Sync' subsection; match labels 'Enable RSS Sync' / 'RSS Interval (minutes)'
- [ ] Remove the 'books with monitor for upgrades enabled' clause and the 'strictly better quality' step — RSS targets only status='wanted'

#### `guides/manual-import.mdx` — _major-update_
> Wrong route/access, backwards default mode, and omits the in-library blocking redirect.
- [ ] Fix access: route is /import, opened from the Library page toolbar overflow menu (not Activity)
- [ ] Fix default import mode: Copy, not Move
- [ ] Fix 'folder icon' → the 'Browse' button (icon is decorative/pointer-events-none)
- [ ] Add the in-library-path block → redirect to Library Import; document Favorite/Recent Folders
- [ ] Fix duplicate handling: two badges (Already in library / Duplicate in scan), force-importable, not hard-skipped

### P2 — 6 pages

#### `getting-started/installation.mdx` — _minor-edits_
> Wrong clone org and missing PUID/PGID/TZ in Docker examples.
- [ ] Fix clone URL to github.com/tjiddy/narratorr.git (not todd)
- [ ] Add PUID/PGID (default 911) to compose + CLI examples with a host-ownership note
- [ ] Add TZ to the compose example

#### `guides/docker.mdx` — _major-update_
> Wrong runtime-user model (claims root) and missing LinuxServer.io conventions the image ships.
- [ ] Fix 'runs as root' → runs as unprivileged 'abc' user via s6-overlay; permission fix is matching PUID/PGID
- [ ] Add PUID/PGID/TZ to compose examples and env-var docs
- [ ] Fix healthcheck example to curl -sf with ${URL_BASE:-} (image already defines HEALTHCHECK)
- [ ] Note ffmpeg is bundled for post-processing

#### `configuration/security.mdx` — _add-sections_
> Accurate on fundamentals but omits TRUSTED_PROXIES for the reverse-proxy scenario it describes.
- [ ] Add TRUSTED_PROXIES guidance to Reverse Proxy Notes (Secure cookies + safe local-bypass; boot warning #1174)
- [ ] Note that changing password/username rotates the session secret and logs out all other devices

#### `configuration/download-clients.mdx` — _minor-edits_
> Accurate except the Blackhole table omits the required Protocol field and mislabels the directory.
- [ ] Add required Protocol (Torrent/Usenet) row; rename 'Watch Folder' to 'Watch Directory'
- [ ] Add a Priority note (lower = preferred, picks among multiple enabled clients)
- [ ] Cross-reference the Remote Path Mappings guide from Docker networking

#### `guides/tagging.mdx` — _minor-edits_
> Technically accurate but wrong settings location and a stale one-click re-tag description.
- [ ] Fix 'Settings > Tagging' / 'Settings > Processing' → 'Settings > Post Processing'
- [ ] Match UI labels: Tag Embedding / Tag Mode / Embed Cover Art (note tagging disabled by default)
- [ ] Expand re-tagging to the preview-and-confirm modal (per-file diff, per-field include/exclude, per-run mode/cover overrides)

#### `guides/blacklist.mdx` — _minor-edits_
> Substance is right; nav and add-flow claims are wrong.
- [ ] Fix location: Settings > Blacklist (not System > Blacklist or Activity page)
- [ ] Fix manual-add: done from the search/releases modal Blacklist button (reason 'other'), not a create UI on the management page
- [ ] Add missing reason user_cancelled; note search filter matches info hash AND guid

### P3 — 5 pages

#### `guides/import-lists.mdx` — _minor-edits_
> Largely accurate; a few field/flow refinements.
- [ ] NYT 'List' is a fixed two-option dropdown labeled 'Bestseller List' (Audio Fiction/Non-Fiction), not free text
- [ ] Describe the non-ASIN search-and-validate path (Dice >= 0.7 + author overlap)
- [ ] Note 'Search Immediately' can trigger an immediate search; add the 5-minute sync-interval minimum and the ABS 'Fetch Libraries' picker

#### `guides/folder-format.mdx` — _add-sections_
> Tokens/examples verified correct; omits Separator/Case/Presets and the prefix grammar.
- [ ] Add a Separator/Case section (transforms every token; defaults space/default)
- [ ] Document conditional-prefix {text?token} and combined {pre?token?suf} forms (used by the Plex preset)
- [ ] Add the Presets dropdown (Standard/Audiobookshelf/Plex/Last-First); fix nav to 'File Naming' section
- [ ] Fix the dangling 'See combined example below' for {year? (}{year?)}

#### `guides/backup-restore.mdx` — _minor-edits_
> Accurate mechanics; missing the migration-flatten restore trap and the direct-restore flow.
- [ ] Add caution: pre-1.0 (pre-flatten) backups fail the 'newer version' check and can't be restored into 1.0+
- [ ] Document the per-row 'Restore' action on server-side backups (not just upload)
- [ ] Note the 1 GB uncompressed-DB restore cap; reword nav to 'Settings > System > Backup & Restore'

#### `guides/remote-path-mappings.mdx` — _minor-edits_
> Fundamentally accurate; one wrong troubleshooting tip and a missing precedence rule.
- [ ] Remove the trailing-slash advice — slashes are normalized, so /downloads and /downloads/ behave identically
- [ ] Add the longest-prefix-wins rule when multiple mappings match
- [ ] Note mappings can also be added while creating a client, not only when editing

#### `index.mdx` — _minor-edits_
> Splash page is mostly fine; one fabricated feature and one loose wording.
- [ ] Remove 'recycling bin' from the Self-Hosted card (no such feature); optionally swap in event history/blacklist/scheduled tasks
- [ ] Soften 'ID3 tags' to format-neutral 'metadata tags' since default M4B output uses MP4 atoms

---

## Detailed findings by page

_Evidence + fix per finding, for the rewrite._

### `index.mdx` — minor-drift

_This is the splash/landing page — high-level marketing copy with six feature cards. Almost every claim checks out against current code: Search Indexers (Torznab/Newznab/Prowlarr, both protocols), Quality Gates (grabFloor/rejectWords/minSeeders), Discovery Engine with "filter-bubble prevention" (the `diversity` suggestion reason, now enabled by default), Import Lists (ABS/NYT/Hardcover + RSS), Audio Processing (M4B merge, bitrate, cover art), and Self-Hosted (Docker, automated backups, health checks, SSE real-time updates) are all backed by real code. One fabricated feature: the "recycling bin" listed in the Self-Hosted card does not exist anywhere in the codebase. One loose-but-low-severity wording issue: "ID3 tags" for M4B output (MP4 containers use metadata atoms, not ID3). The page does NOT need updates for any of the major March-2026 changes flagged (Discovery default-on, Hardcover series, MAM wedge redesign, etc.) because it's a generic splash page that doesn't drill into those specifics — and it already reflects Discovery being a core/default feature._

- **[WRONG/medium]** Feature card 06 "Self-Hosted" (lines 106-110): "Automated backups, recycling bin, health checks, real-time updates." — The "recycling bin" feature does not exist in the codebase. No soft-delete / trash / recycle mechanism is implemented anywhere.
  - _evidence:_ A case-insensitive grep for `recycl` across C:/Users/Todd/Code/narratorr/src returns ZERO matches. The settings registry (src/shared/schemas/settings/registry.ts:42-45) has only `import.deleteAfterImport: false` (a hard delete from the download client) and no trash/recycle/soft-delete delete-mode setting. No `deleteToRecycle`/`softDelete`/`deletedFiles`/`deleteMode` symbols exist. Deletions are hard filesystem removals (audio-processor.ts uses `unlink`/`rm` directly). The other three listed features ARE real: automated backups (src/server/services/backup.service.ts + system.backupIntervalMinutes setting registry.ts:95), health checks (src/server/services/health-check.service.ts), real-time updates (src/server/routes/events.ts + src/client/hooks/useEventSource.ts).
  - _fix:_ Remove "recycling bin" from the feature-06 list. Either drop it entirely ("Automated backups, health checks, real-time updates.") or replace it with a real feature such as "recycling-bin"→"event history" / "blacklist" / "scheduled tasks" — all of which exist in code.

- **[WRONG/low]** Feature card 05 "Audio Processing" (lines 101-105): "embed ID3 tags and cover art". — The default and primary output format is M4B (an MP4 container), which uses MP4 metadata atoms, not ID3 tags — ID3 is MP3-specific. Tag writing is done generically via ffmpeg metadata args, not ID3 specifically.
  - _evidence:_ Default output format is m4b (src/shared/schemas/settings/processing.ts:11 `outputFormat: outputFormatSchema.default('m4b')`, registry.ts:58). The tagging service writes via ffmpeg metadata args (src/server/services/tagging.service.ts: "Build ffmpeg args for writing metadata tags") — there is no ID3-specific tagging path. ID3 only applies to the optional mp3 output format.
  - _fix:_ Soften to format-neutral wording, e.g. "embed metadata tags and cover art" or "embed chapter, tag, and cover-art metadata", since the default M4B output uses MP4 atoms rather than ID3.

### `configuration/download-clients.mdx` — minor-drift

_The per-client connection fields (host, ports, SSL, username/password/API key) and category-support claims are all accurate against the current adapters and registry (qBit 8080, Transmission 9091, SAB 8080, NZBGet 6789, Deluge 8112; Transmission/Blackhole correctly noted as not supporting categories; Deluge labels noted). The Blackhole behavior description (handoff + no progress tracking) is also correct. The one real gap is in the Blackhole section: its field table omits the required Protocol (Torrent/Usenet) field that users must set, and mislabels the directory field. Two minor omissions: per-client Priority and the path-mapping editor embedded in the client form are undocumented here._

- **[MISSING/medium]** ## Blackhole (Watch Folder) — field table (lines 84-92) — The Blackhole field table lists only 'Watch Folder' but omits the required 'Protocol' field (Torrent vs Usenet), which the user MUST set to save a Blackhole client. The field is also labeled 'Watch Directory' in the UI, not 'Watch Folder'.
  - _evidence:_ src/shared/schemas/download-client.ts:51-54 blackholeSettingsSchema requires { watchDir, protocol: z.enum(['torrent','usenet']) }.strict(); src/shared/download-client-registry.ts:102-113 blackhole defaultSettings { watchDir:'', protocol:'torrent' } and requiredFields includes { path:'protocol', message:'Protocol is required' }; src/client/components/settings/BlackholeFields.tsx:25-36 renders a required Protocol <select> (Torrent/Usenet) and the directory field label is 'Watch Directory' (line 16).
  - _fix:_ Add a Protocol row to the Blackhole table — `Protocol | torrent | Whether Narratorr writes .torrent or .nzb files (Torrent / Usenet)` — and rename the existing row's label from 'Watch Folder' to 'Watch Directory' to match the UI. Note both are required.

- **[MISSING/low]** Whole page (no Priority coverage) — Every network client exposes a Priority field (1-100, lower = preferred) in the edit form that determines which client is used when multiple are enabled. The page documents no behavior for multiple enabled clients.
  - _evidence:_ src/client/components/settings/DownloadClientFields.tsx:89-95 renders Priority input with helper 'Lower = preferred (1-100)'; src/shared/schemas/download-client.ts:113 priority z.number().int().min(0).max(100).default(50).
  - _fix:_ Add a short note (e.g. under Testing or a new 'Priority' subsection) that each client has a Priority value where lower is preferred, used to pick among multiple enabled clients.

- **[MISSING/low]** Whole page (no path-mapping reference) — Remote path mappings are configured directly inside the download-client add/edit form, but this page never mentions them or links the dedicated guide, so a reader configuring a client in Docker won't discover them here.
  - _evidence:_ src/client/components/settings/DownloadClientForm.tsx:98-99 embeds RemotePathMappingsSubsection (edit) / PathMappingEditor (create) in the client form; dedicated guide exists at narratorr-docs/src/content/docs/guides/remote-path-mappings.mdx.
  - _fix:_ Add a one-line cross-reference, e.g. under Docker Networking: 'If Narratorr and your client see the filesystem differently, configure Remote Path Mappings on the client form — see the Remote Path Mappings guide.'

### `configuration/environment-variables.mdx` — significant-drift

_The page documents server-level env vars but has drifted significantly from the current config schema (src/server/config.ts). One documented variable (LIBRARY_PATH) is fully removed/decorative and is presented as the canonical way to set the library root — that's actively misleading. Three real env vars (TRUSTED_PROXIES, LOG_LEVEL, MONITOR_INTERVAL_CRON) are missing entirely, including the security-relevant TRUSTED_PROXIES added in the recent reverse-proxy hardening (#1174). DATABASE_URL's "must include file: prefix" claim is wrong (prefix is optional). The canonical env-var table now lives in README.md and includes all the vars this page omits._

- **[WRONG/high]** Reference table, row `LIBRARY_PATH` (line 16); also Docker Overrides block (line 30) and compose example caption (line 13/62) — LIBRARY_PATH is documented as a real config variable with default `./audiobooks` and described as the 'Root directory for your audiobook library'. It is decorative and was removed in #623 — nothing reads it at runtime. The env schema in config.ts does not parse it and the resulting config object has no `libraryPath` property. The library path is configured in Settings (settings.library.path), not via env. Telling users to set LIBRARY_PATH to point at their library is actively misleading — it has no effect.
  - _evidence:_ src/server/config.ts:3-49 — envSchema has no LIBRARY_PATH key, and config (lines 65-76) has no libraryPath. src/server/config.test.ts:145-150 'ignores LIBRARY_PATH env var (decorative, removed in #623)' asserts `config` does NOT have property 'libraryPath'. e2e/fixtures/seed.ts:31,133 'LIBRARY_PATH env var is decorative — nothing reads it at runtime'. docker/s6-service.test.ts:215 asserts the Dockerfile contains no 'ENV LIBRARY_PATH'. The Dockerfile (lines 74-75) sets only CONFIG_PATH and DATABASE_URL.
  - _fix:_ Remove the LIBRARY_PATH row from the Reference table and from the Docker Overrides block. Remove `LIBRARY_PATH=/audiobooks` from line 31. In the compose example (lines 60-62) keep the `/audiobooks` volume mount but drop any implication that LIBRARY_PATH env var sets the library; add a note that the library root is configured in Settings (the container conventionally mounts the library at /audiobooks, and you point Settings at that path).

- **[MISSING/high]** Reference table (after line 19 / wherever security-relevant vars belong) — TRUSTED_PROXIES is a real, security-relevant env var that is completely absent from this page. It controls whether Fastify reads the real client IP/protocol from forwarded headers. When unset behind a reverse proxy it silently breaks forms-auth `Secure` cookies and turns local-network bypass into an auth bypass for every external request. The app now emits a boot warning when it's unset with reverse-proxy auth active (#1174). This is exactly the kind of var an env-var reference page must cover.
  - _evidence:_ src/server/config.ts:36-42 (TRUSTED_PROXIES parsed: comma-separated list, false when empty). src/server/boot-warnings.ts:25-58 (warnIfReverseProxyMisconfigured, #1174). src/server/index.ts:158-159 (checkReverseProxyBootConfig wired at boot). README.md:109 documents it: 'Comma-separated reverse-proxy IPs/CIDRs ... required for forms-auth Secure cookies and local-network bypass'.
  - _fix:_ Add a row: `TRUSTED_PROXIES` | (unset) | Comma-separated reverse-proxy IPs/CIDRs (e.g. `10.0.0.0/8,192.168.0.0/16`) so the real client IP is read from `X-Forwarded-For`. Set this when running behind a reverse proxy — required for forms-auth `Secure` cookies and the local-network bypass to work correctly. See the security/reverse-proxy docs. Mirror README.md:109.

- **[MISSING/medium]** Reference table — LOG_LEVEL is a real env var (the pre-boot Pino log level, and the only way to set log verbosity before the DB-backed General setting takes over). It is absent from the page even though the Logging section of CLAUDE.md tells users to set LOG_LEVEL=debug to trace the search pipeline.
  - _evidence:_ src/server/config.ts:46-48 (enum: fatal|error|warn|info|debug|trace|silent, default 'info'). config.ts comment lines 43-45: 'Initial Pino log level applied at boot. Persisted general.logLevel ... overrides this once the server is up; the env var is the pre-boot default'. README.md:111 documents it.
  - _fix:_ Add a row: `LOG_LEVEL` | `info` | Initial log verbosity at boot: `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent`. The General settings log level overrides this once the server is running. Mirror README.md:111.

- **[MISSING/low]** Reference table — MONITOR_INTERVAL_CRON is a real env var controlling the download-monitor poll cadence. Absent from the page.
  - _evidence:_ src/server/config.ts:32-35 (default '*/30 * * * * *', cron expression). README.md:112 documents it.
  - _fix:_ Add a row: `MONITOR_INTERVAL_CRON` | `*/30 * * * * *` | Download-monitor poll cadence as a cron expression. Mirror README.md:112. (Optionally flag as advanced/rarely-changed.)

- **[WRONG/medium]** Reference table, row `DATABASE_URL` (line 17) — The doc states the value 'Must include the `file:` prefix.' That is wrong — the `file:` prefix is optional. config.ts accepts the path with or without the prefix and strips `file:` if present; the default value itself ('./config/narratorr.db') has no prefix.
  - _evidence:_ src/server/config.ts:12-16 — default '.config/narratorr.db' (no prefix), then `.transform((v) => (v.startsWith('file:') ? v.slice(5) : v))` strips the prefix only if present. README.md:106 explicitly says 'file: prefix optional'.
  - _fix:_ Change the description to: 'libSQL/SQLite database path. The `file:` prefix is optional and is stripped if present.'

- **[MISSING/low]** Docker Overrides / compose example sections — PUID and PGID are real Docker env vars (the production image is built on the linuxserver.io base, which runs the app under PUID/PGID, default 911). The page's compose example and Docker Overrides section omit them, so users hitting permission issues on the /config and /audiobooks volumes have no guidance.
  - _evidence:_ Dockerfile:40 'FROM ghcr.io/linuxserver/baseimage-alpine:3.21 AS runner' (LSIO base = PUID/PGID support). The repo's own docker-compose.yml:20-21 sets PUID=1000/PGID=1000 with comment '(default: 911)'. README.md:35-36 documents both.
  - _fix:_ In the Docker Compose example, add `- PUID=1000` and `- PGID=1000` (note default 911) to the environment block, and mention in prose that these set the UID/GID the container runs as for correct file ownership on mounted volumes (linuxserver.io base image convention).

### `configuration/indexers.mdx` — significant-drift

_The page's structural claims about the four indexer types (Torznab, Newznab, MAM, ABB) and their core fields are broadly accurate, but two areas have drifted significantly from current code. (1) The entire "Prowlarr Import (Recommended)" section describes a pull-based import button + change-preview (New/Updated/Unchanged/Removed) + Import flow that does not exist — the codebase implements Prowlarr integration as a push-based Readarr-compatibility shim (Prowlarr is configured with narratorr as a "Readarr" app and syncs indexers INTO narratorr via /api/v1/indexer), and a client test explicitly asserts no Prowlarr import button/modal renders. (2) The MAM section is materially incomplete: it lists only "MAM ID" and omits the redesigned freeleech-wedge setting (Never/Prefer), the Base URL field, and the account auto-detection card. The cross-cutting "Route through proxy" toggle present on every indexer type is also undocumented. No factual contradictions found in the Torznab/Newznab/ABB field tables themselves._

- **[WRONG/high]** indexers.mdx lines 12-32 (## Prowlarr Import (Recommended) section, Steps block, and :::tip) — The documented Prowlarr integration — a 'Prowlarr Import' button in Settings > Indexers that prompts for Prowlarr URL + API key, runs a Test, then shows a New/Updated/Unchanged/Removed preview you select from and click Import — does not exist in the codebase. The actual model is the reverse: a push-based Readarr-compatibility shim. Narratorr exposes Readarr's API surface (/api/v1/system/status, /api/v1/indexer, /api/v1/indexer/test) and the operator configures narratorr as a 'Readarr' application inside Prowlarr, which then pushes/syncs its indexers into narratorr. There is no UI button, no preview, no client-side import method.
  - _evidence:_ src/server/routes/prowlarr-compat.ts:1-64 defines a Readarr-compatible body schema and is registered at src/server/routes/index.ts:308 exposing GET/POST/PUT/DELETE on /api/v1/indexer (prowlarr-compat.ts:272,288,302,326,368,383). The compat shim impersonates Readarr's API (prowlarr-compat.ts:54-61 comment). On the client side, src/client/lib/api/indexers.ts:18-39 has only CRUD + test methods — no import/preview/sync method. src/client/pages/settings/IndexersSettings.test.tsx:72-78 asserts 'does not render the Prowlarr import button or modal' (queries for /prowlarr/i button and 'Import from Prowlarr' text return null). Pushed indexers are tagged via the `source: 'prowlarr'` field (src/client/lib/api/indexers.ts:11, IndexerCard.tsx:92).
  - _fix:_ Rewrite the Prowlarr section to describe the push model: instruct users to add narratorr to Prowlarr as a Readarr-type application (App Sync), pointing Prowlarr at narratorr's base URL + API key, then sync — Prowlarr pushes Torznab/Newznab indexers into narratorr, which appear with a 'Managed by Prowlarr' badge and read-only API URL/Key fields. Remove the fictional button/preview/Import-button Steps. Optionally note the liberal-shim behavior (Readarr echo-only fields like categories/seedCriteria are accepted and ignored).

- **[MISSING/high]** indexers.mdx lines 80-90 (## MyAnonamouse (MAM) field table — lists only 'MAM ID') — The MAM section omits the freeleech-wedge setting, which was redesigned and is now a prominent user-facing field. It is a two-option select ('Attempt to use wedges when downloading': Never / Prefer). 'Prefer' appends a server-side `&fl` flag to the MAM download URL at grab time for torrents that aren't already freeleech, so MAM applies a personal freeleech wedge itself. (The old 3-option Never/Preferred/Required + minWedgeReserve + client-side bonusBuy.php purchase model is gone.)
  - _evidence:_ Schema: src/shared/schemas/indexer.ts:31-32 (wedgeModeSchema = z.enum(['never','preferred'])) and :44 (useFreeleechWedge default 'never'). UI: src/client/components/settings/indexer-fields/mam-fields.tsx:233-249 (WedgeFields: label 'Attempt to use wedges when downloading', options Never/Prefer, helper text 'Prefer applies a personal freeleech wedge at download time for torrents that aren't already freeleech'). Adapter: src/core/indexers/myanonamouse.ts:379 (applyWedge = useFreeleechWedge === 'preferred' && !ctx.isFreeleech) and :406-407 (appends '&fl' to /tor/download.php?tid=...).
  - _fix:_ Add a 'Freeleech Wedge' row to the MAM field table: 'Never (default) or Prefer. When set to Prefer, Narratorr appends a server-side freeleech flag at download time so MAM spends a personal freeleech wedge on torrents that aren't already freeleech.'

- **[MISSING/medium]** indexers.mdx lines 84-90 (MAM field table) — The MAM table omits the optional 'Base URL' field (for custom MAM mirrors) and does not mention the account auto-detection behavior. When a valid MAM ID is entered, Narratorr probes MAM and renders an account card showing Username, Class, VIP status, available Wedges, and exit IP — useful context the docs don't surface.
  - _evidence:_ Base URL field: src/client/components/settings/indexer-fields/mam-fields.tsx:208-231 (BaseUrlField, label 'Base URL (optional)', placeholder https://www.myanonamouse.net, helper 'Only change if using a custom MAM mirror'); schema src/shared/schemas/indexer.ts:36 (baseUrl optional). Auto-detection card: mam-fields.tsx:86-135 (MamAccountCard renders Username/Class/Search/Wedges/Exit IP) driven by useMamDetection (mam-fields.tsx:29-83).
  - _fix:_ Add a 'Base URL (optional)' row to the MAM table ('Only change if using a custom MAM mirror'), and add a sentence noting that entering a valid MAM ID auto-detects and displays your MAM account status (username, class, VIP, wedges, exit IP).

- **[MISSING/medium]** indexers.mdx — all four indexer field tables (Torznab L52-56, Newznab L96-100, MAM L84-86, ABB L38-42) — Every indexer type exposes a 'Route through proxy' toggle (useProxy) that sends search and test requests through the global proxy configured in Settings > General. The page documents none of it. There's also a UI warning when the toggle is on but no global proxy URL is set.
  - _evidence:_ src/client/components/settings/IndexerFields.tsx:20 renders <UseProxyField> for all types. src/client/components/settings/indexer-fields/use-proxy-field.tsx:21-34 (label 'Route through proxy', helper 'Send search and test requests through the global proxy', amber warning 'No proxy URL configured in Settings > General' at :30-34). Schema: useProxy is in apiKeySettingsFields (indexer.ts:17), mamSettingsSchema (:42), and abbSettingsSchema (:51).
  - _fix:_ Add a 'Route through proxy' row (or a shared note above the type sections) explaining the toggle routes that indexer's traffic through the global proxy from Settings > General, with a caveat that the proxy must be configured there first.

- **[STALE/low]** indexers.mdx lines 30-32 (:::tip 'Prowlarr import pulls Torznab and Newznab indexers. You can re-run the import anytime to sync changes from Prowlarr.') and lines 88-90 (:::tip under MAM about importing MAM via Prowlarr) — Both tips assume the pull-based 'Prowlarr import' that doesn't exist. The phrasing 'you can re-run the import anytime' and 'importing via Prowlarr is the simplest setup' frame Narratorr as pulling from Prowlarr, which is backwards — Prowlarr syncs into Narratorr on its own schedule via the Readarr-app sync.
  - _evidence:_ Same evidence as the Prowlarr-Import finding: integration is push-based (src/server/routes/prowlarr-compat.ts registered at routes/index.ts:308; client has no import/sync method in src/client/lib/api/indexers.ts).
  - _fix:_ Reword both tips to reflect Prowlarr's App-Sync push model: 'Prowlarr syncs Torznab/Newznab indexers into Narratorr automatically once Narratorr is added as a Readarr application; re-sync happens on Prowlarr's schedule.' For the MAM tip, keep the recommendation but phrase it as 'let Prowlarr manage MAM and sync it to Narratorr' rather than 'import via Prowlarr.'

### `configuration/library.mdx` — significant-drift

_The page's core "Library Path" section is built on a removed feature: the LIBRARY_PATH env var was deleted (#623) and is now decorative/ignored by config.ts — the Dockerfile and docker-compose explicitly do NOT set it, and there is no "manual install" ./audiobooks default. The library path is a database setting configured in the Settings UI; /audiobooks is the registry default for all install types. The page's settings-navigation references are also wrong: Folder/File Format live in a "File Naming" section, and the Library Path lives in a "Library" section, both on the General settings page — there is no "Settings > Library" tab. Import settings are also a section on the General page (no "Settings > Import" tab), and the Processing page is labeled "Post Processing". The Import Behavior flow narrative is broadly accurate. Naming Separator/Case options are undocumented (minor)._

- **[WRONG/high]** Library Path section, bullet: "**Override:** Set the `LIBRARY_PATH` environment variable" (line 12) — The LIBRARY_PATH environment variable was removed (#623) and is now decorative — nothing reads it at runtime. The library path is set via the Settings UI and persisted in the database, not via an env var. Telling users to set LIBRARY_PATH to override the path is actively wrong; it has no effect.
  - _evidence:_ src/server/config.ts defines no LIBRARY_PATH key (only PORT, CORS_ORIGIN, CONFIG_PATH, DATABASE_URL, AUTH_BYPASS, URL_BASE, MONITOR_INTERVAL_CRON, TRUSTED_PROXIES, LOG_LEVEL). src/server/config.test.ts:145 — test 'ignores LIBRARY_PATH env var (decorative, removed in #623)' asserts config has no libraryPath property even when the env var is set. docker/s6-service.test.ts:215 and :236 assert the Dockerfile and docker-compose.yml do NOT contain LIBRARY_PATH. e2e/fixtures/seed.ts:31 comment: 'LIBRARY_PATH env var is decorative — nothing reads it at runtime.' The actual path is settings.library.path (src/shared/schemas/settings/library.ts:100).
  - _fix:_ Remove the LIBRARY_PATH override bullet. Replace with: the library path is configured in the Settings UI (Settings > General > Library section, the 'Library Path' field) and stored in the database. For Docker, mount your host audiobook directory to the container's /audiobooks volume and leave the path at its default.

- **[WRONG/medium]** Library Path section, bullets: "**Docker default:** `/audiobooks`" and "**Manual install default:** `./audiobooks`" (lines 10-11) — There is no separate 'manual install' ./audiobooks default. The single default library path is /audiobooks for every install type, sourced from the settings registry — not derived from the install method or a relative working-directory path.
  - _evidence:_ src/shared/schemas/settings/registry.ts:35 — library defaults: { path: '/audiobooks', ... }. This DEFAULT_SETTINGS value is the only fallback (settings.service.ts:34/42 returns DEFAULT_SETTINGS[key]). librarySettingsSchema (library.ts:100) has no .default() on path — it is a required field, so there is no schema-level './audiobooks' fallback. No './audiobooks' string exists anywhere in src.
  - _fix:_ Replace the two default bullets with a single statement: the default library path is `/audiobooks`, set in the Settings UI. For Docker this is a volume mount; for manual installs, change it in Settings to a real directory on your host.

- **[WRONG/medium]** Folder Format section ("Configure it in **Settings > Library > Folder Format**", line 18) and File Format section ("Configure it in **Settings > Library > File Format**", line 37) — There is no 'Library' tab in Settings, and Folder Format / File Format are not under a 'Library' page. They live in a section titled 'File Naming' which is rendered on the General settings page. The Library Path field is in a separate 'Library' section, also on the General page.
  - _evidence:_ src/client/pages/settings/registry.ts:35-46 — the settings nav has no 'Library' entry; tabs are General, Post Processing, Indexers, Download Clients, Search, Notifications, Blacklist, Security, Import Lists, System. src/client/pages/settings/GeneralSettings.tsx:35-37 renders <LibrarySettingsSection/> then <NamingSettingsSection/>. NamingSettingsSection.tsx:258 titles the section 'File Naming' and contains the Folder Format (line 274) and File Format (line 291) fields. LibrarySettingsSection.tsx:85 titles its section 'Library' but only contains the Library Path field + Bulk Operations.
  - _fix:_ Change both navigation references to 'Settings > General > File Naming section' (the section is titled 'File Naming', not 'Library'). For the Library Path section of this doc, note the field lives in Settings > General > Library section.

- **[WRONG/low]** Related Settings list (lines 54-56): "Settings > Import" and "Settings > Processing" — Two navigation paths are wrong. (1) Delete After Import / Minimum Seed Time are in an 'Import' section on the General settings page, not a standalone 'Settings > Import' tab. (2) The processing page is labeled 'Post Processing', not 'Processing'.
  - _evidence:_ GeneralSettings.tsx:38 renders <ImportSettingsSection/> on the General page; ImportSettingsSection.tsx:29 titles it 'Import'. There is no 'import' entry in settingsPageRegistry (registry.ts:35-46). The processing page entry is registry.ts:37 — { path: 'post-processing', label: 'Post Processing', ... }, so the nav label is 'Post Processing' not 'Processing'.
  - _fix:_ Change 'Settings > Import' to 'Settings > General > Import section' and 'Settings > Processing' to 'Settings > Post Processing'.

- **[MISSING/low]** Folder Format / File Format sections — The page omits the Separator and Case naming controls (and the naming presets) that sit alongside Folder/File Format in the File Naming section. These materially affect how folder/file names are generated (e.g., spaces vs periods, lowercasing).
  - _evidence:_ src/shared/schemas/settings/library.ts:95-97 define namingSeparatorSchema (default 'space') and namingCaseSchema (default 'default'); registry.ts:35 includes namingSeparator/namingCase in library defaults. NamingSettingsSection.tsx:265-270 renders 'Separator' (Space/Period/Underscore/Dash) and 'Case' (Default/lowercase/UPPERCASE/Title Case) selects plus a 'Preset' selector (line 261).
  - _fix:_ Add a brief note in/after the Folder Format section that the File Naming section also includes Separator (Space/Period/Underscore/Dash) and Case (Default/lowercase/UPPERCASE/Title Case) controls, and selectable naming presets, that apply to generated folder and file names.

### `configuration/network.mdx` — significant-drift

_The page's proxy mechanics are materially wrong against current code. The single biggest issues: (1) the global proxy is NOT applied to metadata lookups or "any outbound HTTP request" — it is scoped exclusively to indexer search/test traffic, and only when a per-indexer "Route through proxy" (useProxy) toggle is enabled; (2) that per-indexer toggle — the actual gate that makes the proxy do anything — is completely omitted from the page; (3) the page repeatedly points users to a "Settings > Network" location that does not exist (the proxy lives in the "Network" section of Settings > General). The proxy URL field, scheme validation (http/https/socks5), Test Proxy/exit-IP behavior, credential redaction, and the FlareSolverr-is-per-indexer note are all accurate. FlareSolverr is mischaracterized as a "proxy override" when it is a Cloudflare-bypass mechanism that happens to take adapter-level precedence._

- **[WRONG/high]** ## What Gets Proxied (lines 27-36) — The page claims the global proxy applies to metadata provider lookups and 'any outbound HTTP request from the server.' In current code the global proxy is consumed in exactly one place — IndexerService — and is applied only to indexer adapters. Metadata providers and cover downloads do not route through it.
  - _evidence:_ src/server/services/indexer.service.ts:200-203 getProxyUrl() reads network.proxyUrl; it is passed only to createAdapter() (lines 210-213, 261-263). Metadata adapters do not reference proxy at all: src/core/metadata/audible.ts has no proxy/dispatcher reference; src/core/metadata/hardcover.ts:192 uses fetchWithTimeout(GRAPHQL_URL,...) which attaches no proxy dispatcher (src/core/utils/network-service.ts:97). A repo-wide search for network.proxyUrl/getProxyUrl consumers returns only indexer.service.ts, proxy.ts, and MAM — not metadata or cover-download.ts. The in-app section description confirms scope: 'Configure proxy for indexer traffic' (src/client/pages/settings/NetworkSettingsSection.tsx:74).
  - _fix:_ Rewrite 'What Gets Proxied' to state the global proxy applies ONLY to indexer search and test requests (and only for indexers with the per-indexer proxy toggle enabled). Remove 'Metadata provider lookups' and 'Any outbound HTTP request from the server' from the 'applies to' list. Add metadata/cover-art lookups to the 'does not apply to' list.

- **[MISSING/high]** ## What Gets Proxied / ## Per-Indexer Proxy Override — The page omits the per-indexer 'Route through proxy' (useProxy) toggle, which is the gate that makes the global proxy do anything. Setting a global Proxy URL alone has zero effect; each indexer must individually opt in.
  - _evidence:_ src/server/services/indexer.service.ts:235-236: 'const useProxy = settings.useProxy === true; const effectiveProxyUrl = useProxy ? proxyUrl : undefined;' — the global proxyUrl is dropped to undefined unless the indexer's useProxy flag is set. UI toggle: src/client/components/settings/indexer-fields/use-proxy-field.tsx:21-24 label 'Route through proxy' / 'Send search and test requests through the global proxy.' The Network section help text says so too: 'Route indexer search and test traffic through an HTTP or SOCKS5 proxy. Enable per-indexer in Settings > Indexers.' (NetworkSettingsSection.tsx:107).
  - _fix:_ Add a step documenting that after setting the global Proxy URL, you must enable 'Route through proxy' on each indexer (Settings > Indexers) for it to take effect. Note the global URL is inert until at least one indexer opts in.

- **[WRONG/medium]** Line 8 ('Configure the global proxy in Settings > Network') and the page's repeated 'Settings > Network' references (also lines 38-46 context, line 71) — There is no 'Network' tab in Settings. The proxy lives in the 'Network' section of the General settings page. Every 'Settings > Network' instruction points to a nonexistent location.
  - _evidence:_ Settings nav registry has no Network entry — tabs are General, Post Processing, Indexers, Download Clients, Search, Notifications, Blacklist, Security, Import Lists, System (src/client/pages/settings/registry.ts:35-46). The Network section is rendered inside the General page: src/client/pages/settings/GeneralSettings.tsx:39 <NetworkSettingsSection />. The in-app proxy help even points users to General: 'No proxy URL configured in Settings > General' (use-proxy-field.tsx:32).
  - _fix:_ Replace 'Settings > Network' with 'Settings > General' (the proxy URL is in the 'Network' section of the General page). Update the intro line and the Docker-compose comment on line 56.

- **[WRONG/medium]** ## Per-Indexer Proxy Override (lines 38-46) — FlareSolverr is mischaracterized as a per-indexer 'proxy override' that routes requests 'instead of the global proxy.' FlareSolverr is a Cloudflare-bypass mechanism (headless browser solving challenges), a separate field from the proxy toggle. It is not an HTTP/SOCKS proxy and isn't an 'override' of the Network proxy in any user-facing sense — they are independent indexer fields.
  - _evidence:_ src/core/indexers/fetch.ts:1-5 docstring: FlareSolverr routes via POST {url}/v1 cmd request.get to bypass Cloudflare — not a transport proxy. UI help: src/client/components/settings/indexer-fields/flaresolverr-field.tsx:22 'Routes requests through FlareSolverr/Byparr to bypass Cloudflare.' Adapter precedence in src/core/indexers/torznab.ts:109-119 shows flareSolverrUrl and proxyUrl are distinct paths (FlareSolverr wins if both set), but they are separate settings, not an override relationship the user configures as such. The doc's own :::note already says FlareSolverr is for Cloudflare bypass, contradicting the 'proxy override' framing above it.
  - _fix:_ Reframe this section as two independent per-indexer transport options: (1) the 'Route through proxy' toggle (uses the global Network proxy), and (2) the FlareSolverr URL field (Cloudflare bypass via a separate FlareSolverr/Byparr service). Drop the 'override the global proxy' language; if precedence is worth mentioning, note FlareSolverr takes precedence when both are set on the same indexer.

- **[STALE/low]** Examples block (lines 16-19) and Proxy URL table (line 14) — Minor: the UI placeholder advertises http and socks5 only ('http://user:pass@proxy:8888 or socks5://localhost:1080'), while the doc and schema both also accept https. Not wrong, but the doc may overstate https as a common case; confirm https is intended to stay supported.
  - _evidence:_ Schema accepts http/https/socks5 (src/shared/schemas/settings/network.ts:3 VALID_PROXY_SCHEMES = ['http:', 'https:', 'socks5:']) — so https IS valid and the doc is correct. UI placeholder omits https (NetworkSettingsSection.tsx:85). No code contradiction; flagged only as a low-severity consistency note.
  - _fix:_ No change required for correctness. Optionally align the doc examples with the in-app placeholder ordering, or leave as-is since https is genuinely supported.

### `configuration/notifications.mdx` — major-gaps

_The page documents only 3 notifier types (Webhook, Discord, Script) but the app ships 9 — Email, Telegram, Slack, Pushover, ntfy, and Gotify are entirely undocumented. Beyond that omission, several factual claims about the Webhook and Script notifiers are wrong: webhook headers use JSON format (not "Key: Value, one per line"), template variables only render in the body template (not the URL/headers as claimed), the body-template field is undocumented, the script timeout is configurable (not a hardcoded 30s), and the on_health_issue event is missing from the events table. The core concept (event-driven, non-blocking, multi-notifier, per-notifier enable/test) is still accurate._

- **[MISSING/high]** ## Notifier Types (whole section, lines 21-106) — Six of the nine notifier types are completely undocumented. The page only covers Webhook, Discord, and Script.
  - _evidence:_ src/shared/notifier-registry.ts:4 defines NOTIFIER_TYPES = ['webhook','discord','script','email','telegram','slack','pushover','ntfy','gotify']. Each has a registry entry (lines 18-86) with its own fields, a settings schema in src/shared/schemas/notifier.ts:31-63, an adapter in src/core/notifiers/{email,telegram,slack,pushover,ntfy,gotify}.ts, and a UI field component in src/client/components/settings/notifier-fields/components.tsx.
  - _fix:_ Add sections for Email (smtpHost/smtpPort default 587/smtpUser/smtpPass/smtpTls/fromAddress/toAddress), Telegram (botToken/chatId), Slack (webhookUrl), Pushover (pushoverToken/pushoverUser), ntfy (ntfyTopic required, ntfyServer optional), and Gotify (gotifyUrl/gotifyToken) — mirroring the per-type fields in NOTIFIER_REGISTRY and notifier.ts schemas.

- **[WRONG/high]** Webhook field table, line 32: "Headers | Optional custom headers (one per line, `Key: Value` format)" — Webhook headers are entered as JSON, not one-per-line Key: Value pairs.
  - _evidence:_ UI label is "Headers (JSON)" with placeholder '{"Authorization": "Bearer ..."}' and help text "Optional JSON key-value pairs" (src/client/components/settings/notifier-fields/components.tsx:27-29). The backend parses headers with JSON.parse (src/core/notifiers/registry.ts:14-21 parseWebhookHeaders; notifier.service.ts:208 also JSON.parse-validates and warns on malformed JSON).
  - _fix:_ Change the Headers row to: "Optional custom headers as a JSON object, e.g. {\"Authorization\": \"Bearer your-token\"}". Update the :::tip on line 56-58 accordingly (it describes adding an Authorization header — keep the advice but use JSON syntax).

- **[WRONG/high]** Webhook section, line 34: "You can use template variables in the URL and headers:" — Template variables are NOT substituted in the URL or headers. They are only rendered inside the (undocumented) Body Template field.
  - _evidence:_ WebhookNotifier.send (src/core/notifiers/webhook.ts:44-59) passes this.config.url and this.config.headers through verbatim; only this.config.bodyTemplate is passed to renderBody (lines 51-56). The registry factory (src/core/notifiers/registry.ts:24-29) likewise sets url/headers raw and only forwards bodyTemplate for rendering.
  - _fix:_ Reframe the variable table: the tokens are substituted into the Body Template field (not URL/headers). Document the Body Template field itself (textarea; leave empty for the default JSON payload of the full event object).

- **[MISSING/medium]** Webhook field table, lines 27-32 — The Body Template field is missing from the Webhook field table, even though it is the only place webhook tokens actually work.
  - _evidence:_ UI defines a "Body Template" textarea (src/client/components/settings/notifier-fields/components.tsx:31-37); schema field bodyTemplate (src/shared/schemas/notifier.ts:18); registry default bodyTemplate: '' (src/shared/notifier-registry.ts:21). Help text: "Leave empty for default JSON."
  - _fix:_ Add a "Body Template" row: "Optional. Custom request body with {token} placeholders. Leave empty to send the full event payload as default JSON."

- **[MISSING/medium]** ## Events table, lines 14-19 — The events table omits the On Health Issue event.
  - _evidence:_ NOTIFICATION_EVENTS includes 'on_health_issue' (src/shared/notification-events.ts:7-13) with label 'Health Issue' (EVENT_LABELS line 22). Discord renders a dark-orange embed for it (src/core/notifiers/discord.ts:17,60-66) and the script/webhook adapters expose health.* tokens/env vars.
  - _fix:_ Add a row: "**On Health Issue** | A health check transitions state (e.g. healthy → warning/error)". Also add the dark-orange color to the Discord embed color list (lines 69-73).

- **[WRONG/medium]** Script section, lines 88-97 — Multiple Script inaccuracies: the field is "Script Path" (not "Command"), the 30s timeout is configurable (not a fixed hard limit), and the type is labeled "Custom Script" in the UI.
  - _evidence:_ Registry label is 'Custom Script' (src/shared/notifier-registry.ts:32). UI field is "Script Path" plus a configurable "Timeout (seconds)" number input min=1 max=300 (components.tsx:60-74). Schema: timeout z.number().int().min(1).max(300).optional() (notifier.ts:28); default 30 (registry line 33). ScriptNotifier uses (this.config.timeout ?? 30) * 1000 (src/core/notifiers/script.ts:54).
  - _fix:_ Rename the "Command" field to "Script Path"; add a "Timeout (seconds)" field (default 30, range 1-300). Change "Scripts have a 30-second timeout" to "Scripts have a configurable timeout (default 30s, max 300s)".

- **[MISSING/low]** Webhook variable table, lines 36-48 — The variable table omits {book.coverUrl} and the health.* tokens that the body-template renderer supports.
  - _evidence:_ renderBody's flat map (src/core/notifiers/webhook.ts:16-34) includes 'book.coverUrl', 'health.checkName', 'health.previousState', 'health.currentState', and 'health.message' in addition to the documented tokens.
  - _fix:_ Add {book.coverUrl} and the four health.* tokens (health-issue events only) to the variable table.

### `configuration/security.mdx` — minor-drift

_The page's core claims all verify against current code: auth modes (none/basic/forms), API key via X-Api-Key header or ?apikey= query, rate limit of 5 attempts per 15-minute window with Retry-After header, scrypt + timing-safe password comparison, HMAC-SHA256 7-day sliding sessions, AES-256-GCM at-rest encryption with secret.key / NARRATORR_SECRET_KEY, and the AUTH_BYPASS recovery flow. No outright-wrong factual claims. The drift is from security hardening shipped since the docs were written (~March 2026): the Reverse Proxy Notes section never mentions the TRUSTED_PROXIES requirement even though it describes the exact reverse-proxy + local-bypass scenario that TRUSTED_PROXIES makes safe, and the page omits that changing the password/username now rotates the session secret (logs out all other sessions). Both are MISSING, not wrong. No high-severity issues._

- **[MISSING/high]** ## Local Network Bypass (line 46) and ### Reverse Proxy Notes (lines 83-88) — The page describes the reverse-proxy + local-network-bypass deployment as a primary use case but never mentions the TRUSTED_PROXIES environment variable, which is required for both forms-auth cookie security and safe local-bypass behavior behind a proxy.
  - _evidence:_ src/server/utils/cookie-options.ts:10 sets the session cookie's Secure attribute from `request.protocol === 'https'`, which only reflects the real client protocol when TRUSTED_PROXIES is set (src/server/config.ts:36-42 parses it; default is `false`). src/server/boot-warnings.ts:37-57 (warnIfReverseProxyMisconfigured, #1174) emits boot warnings precisely because, without TRUSTED_PROXIES, forms cookies lose the Secure flag and local-bypass treats every external request as the proxy's private-bridge IP — authenticating all external traffic as 'local-bypass'. The comment at boot-warnings.ts:34 even cites 'SECURITY.md §Reverse-proxy deployments' as the place this should be documented. TRUSTED_PROXIES is also absent from configuration/environment-variables.mdx.
  - _fix:_ Add a note to the Reverse Proxy Notes section: when Narratorr runs behind a reverse proxy, set TRUSTED_PROXIES (comma-separated proxy IPs/CIDRs) so Narratorr trusts X-Forwarded-* headers. Explain that without it, (a) forms-auth session cookies are set without the Secure attribute over the proxy's HTTP hop, and (b) Local Network Bypass treats every forwarded request as local and skips auth. Also add TRUSTED_PROXIES to the environment-variables reference.

- **[MISSING/low]** ## How Credentials Are Stored > User Passwords (lines 58-62) — The page doesn't mention that changing your password (or username) rotates the session secret, which invalidates every previously-issued session cookie on all devices.
  - _evidence:_ src/server/services/auth.service.ts:315-318 (changePassword) sets a fresh `config.sessionSecret = randomBytes(32).toString('hex')` after the credential update, so all prior cookies fail HMAC verification; the route reissues a fresh cookie only for the current device (src/server/routes/auth.ts:196, reissueSessionCookie). The doc's session/credentials section is silent on this behavior.
  - _fix:_ Add one line under User Passwords or Forms auth noting that changing your password or username signs you out everywhere except the current device (all other active sessions are invalidated).

### `configuration/settings.mdx` — significant-drift

_The Settings Overview page is materially out of date with the current settings registry and UI. The single worst issue: the General section's "Recycle Retention" row documents a feature that does not exist anywhere in the codebase (no recycling-bin code at all) and links to a dead /guides/recycling-bin/ page — the actual 30-day field in General is "Series Cache Retention." Several defaults/labels are wrong (Min Seeders default is 1 not 0; Max Concurrent lives under Processing not Import). And the page omits entire shipped settings areas: the Metadata Hardcover API key (new), the whole Filtering section (Languages, Min Duration, plus reject/required words actually live here), Search Priority, Min/Max Download Size, Minimum Seed Ratio, Redownload Failed, and the naming Separator/Case fields. The Discovery default is now enabled (page says off), and Weight Multipliers is documented as a setting but is not user-editable._

- **[WRONG/high]** ## General table, row 'Recycle Retention' — Documents a 'Recycle Retention' / recycling-bin setting that does not exist. There is no recycling-bin feature anywhere in the codebase, and the linked /guides/recycling-bin/ page is dead. The actual second General field (30-day default) is 'Series Cache Retention'.
  - _evidence:_ src/shared/schemas/settings/general.ts:9-11 defines only housekeepingRetentionDays (default 90) and seriesCacheRetentionDays (default 30); no recycle field. GeneralSettingsForm.tsx:38,57 renders labels 'Event History Retention (days)' and 'Series Cache Retention (days)'. Codebase-wide grep for 'recycl'/'recycle'/'trashbin' returns zero matches.
  - _fix:_ Replace the 'Recycle Retention' row with: '**Series Cache Retention** | Days to keep cached series rows whose books have all been removed from the library before pruning. Range: 1–365. Default: 30.' Remove the link to /guides/recycling-bin/. Also retitle 'Event Retention' to match the UI label 'Event History Retention'.

- **[WRONG/medium]** ## Quality table, row 'Min Seeders' — States Min Seeders default is 0; the actual default is 1.
  - _evidence:_ src/shared/schemas/settings/quality.ts:12 `minSeeders: z.number().int().nonnegative().default(1)`; registry.ts:78 `minSeeders: 1`.
  - _fix:_ Change 'Default: 0.' to 'Default: 1.' for Min Seeders.

- **[WRONG/medium]** ## Import table, row 'Max Concurrent Processing' — Lists 'Max Concurrent Processing' under the Import section. This setting is not in the import schema — it lives in the Processing schema and is rendered in the Post Processing UI section, labeled 'Max Concurrent Jobs'.
  - _evidence:_ src/shared/schemas/settings/import.ts has no such field; src/shared/schemas/settings/processing.ts:15 `maxConcurrentProcessing: z.number().int().min(1).default(2)`; ProcessingSettingsSection.tsx:266-276 renders it under 'Post Processing' with label 'Max Concurrent Jobs'.
  - _fix:_ Remove the 'Max Concurrent Processing' row from the Import table and add it to the Processing table as '**Max Concurrent Jobs** | Maximum number of imports running simultaneously. Default: 2.'

- **[WRONG/low]** ## Discovery table, row 'Enabled' — States the discovery engine defaults to off; it now defaults to on (enabled by default).
  - _evidence:_ src/shared/schemas/settings/discovery.ts:12 `enabled: z.boolean().default(true)`; registry.ts:99 `enabled: true`.
  - _fix:_ Change 'Default: off.' to 'Default: on.' for the Discovery Enabled row.

- **[WRONG/low]** ## Quality table, rows 'Protocol Preference', 'Reject Words', 'Required Words' — Page groups Protocol Preference under Quality and Reject/Required Words under Quality, but the UI surfaces Protocol Preference in the Search section and Reject/Required Words in a separate Filtering section. Reject Words also now has a non-empty default and matches more than just title.
  - _evidence:_ SearchSettingsSection.tsx:132-142 renders Protocol Preference. FilteringSettingsSection.tsx:103-129 renders Reject Words / Required Words. quality.ts:7 DEFAULT_REJECT_WORDS = 'Virtual Voice, Free Excerpt, Sample, Behind the Scenes, Abridged' (default is not empty). FilteringSettingsSection hint: reject matches 'title, subtitle, author, narrator, or format type'.
  - _fix:_ Note that Protocol Preference appears under Search in the UI, move Reject/Required Words to a documented Filtering section, and state the Reject Words default ('Virtual Voice, Free Excerpt, Sample, Behind the Scenes, Abridged') and that it checks title/subtitle/author/narrator/format.

- **[MISSING/high]** ## Metadata section — Omits the Hardcover API Key setting (shipped recently). The Metadata section only documents Audible Region.
  - _evidence:_ src/shared/schemas/settings/metadata.ts:11 `hardcoverApiKey: z.string().default('')`; MetadataSettingsSection.tsx:102-123 renders the 'Hardcover API Key' field with a Test button.
  - _fix:_ Add a row: '**Hardcover API Key** | Optional key that populates the Series card on book pages with Hardcover-canonical members. Without a key, Series cards show only library books sharing the series name.'

- **[MISSING/high]** No 'Filtering' section in the page — The entire Filtering settings area is undocumented: Languages (multi-select) and Minimum Duration, both of which gate search results. These are real, shipped, user-facing settings with no coverage.
  - _evidence:_ src/shared/schemas/settings/metadata.ts:9 `languages` (default ['english']) and :10 `minDurationMinutes` (default 0); FilteringSettingsSection.tsx:67-101 renders Languages and Minimum Duration; results in unselected languages are excluded.
  - _fix:_ Add a '## Filtering' section documenting Languages (results in unselected languages excluded; no-language results pass through; deselect all to disable) and Minimum Duration (minutes; filters promo excerpts/TTS; 0 to disable).

- **[MISSING/medium]** ## Quality table — Omits Min Download Size and Max Download Size, two shipped quality-gate settings.
  - _evidence:_ src/shared/schemas/settings/quality.ts:13-14 `minDownloadSize` (default 0) and `maxDownloadSize` (default 5); QualitySettingsSection.tsx:78-114 renders 'Min Download Size (MB)' and 'Max Download Size (GB)'.
  - _fix:_ Add rows: '**Min Download Size** | Minimum download size in MB. Filters tracker-test/preview/corrupt releases. Default: 0 (disabled).' and '**Max Download Size** | Maximum download size in GB. Larger releases hidden. Default: 5.'

- **[MISSING/medium]** ## Import table — Omits Minimum Seed Ratio and Redownload Failed, both shipped import settings.
  - _evidence:_ src/shared/schemas/settings/import.ts:6 `minSeedRatio` (default 0) and :8 `redownloadFailed` (default true); ImportSettingsSection.tsx:66-95 renders both.
  - _fix:_ Add rows: '**Minimum Seed Ratio** | Minimum upload ratio before removing a torrent (applies when Delete After Import is on). Default: 0 (disabled).' and '**Redownload Failed** | Automatically search for a different release when a download fails. Default: on.'

- **[MISSING/low]** ## Search table — Omits Search Priority, a shipped Search setting that controls quality-vs-narrator-accuracy result ordering.
  - _evidence:_ src/shared/schemas/settings/search.ts:9 `searchPriority` (default 'quality'); SearchSettingsSection.tsx:119-130 renders 'Search Priority' with options Audio Quality / Narrator Accuracy.
  - _fix:_ Add a row: '**Search Priority** | Order results by `quality` (higher bitrate) or `accuracy` (match metadata narrator). Default: quality.'

- **[MISSING/low]** ## Library table — Omits the naming Separator and Case settings that affect folder/file naming output.
  - _evidence:_ src/shared/schemas/settings/library.ts:102-104 `namingSeparator` (default 'space') and `namingCase` (default 'default'); rendered via NamingSettingsSection.
  - _fix:_ Add rows for Separator (word separator used in rendered names; default space) and Case (casing transform; default no change), or link to the Folder Format guide where they're documented.

- **[STALE/low]** ## Discovery table, row 'Weight Multipliers' — Documents 'Weight Multipliers' as a configurable per-category setting, but it is not user-editable — it is computed server-side and explicitly excluded from the Discovery form.
  - _evidence:_ src/shared/schemas/settings/discovery.ts:22-39 form schema excludes weightMultipliers with comment 'computed by DiscoveryService during refreshes, not editable in the Discovery settings form'; DiscoverySettingsSection.tsx form has no multiplier inputs.
  - _fix:_ Remove the 'Weight Multipliers' row from the Discovery settings table (it is not a user-facing setting), or relabel it as internal/computed.

- **[STALE/low]** ## Processing table, row 'Enabled'; ## Tagging table, row 'Enabled' — Page lists a Processing 'Enabled' toggle that does not exist (there is no processing.enabled field). Tagging is also no longer a separate top-level section — it is nested inside the 'Post Processing' UI as a 'Tag Embedding' toggle.
  - _evidence:_ src/shared/schemas/settings/processing.ts has no `enabled` field; ProcessingSettingsSection.tsx renders tagging (enabled/mode/embedCover) inline under 'Post Processing' (lines 279-318), titled 'Tag Embedding'. There is no standalone Processing on/off toggle.
  - _fix:_ Remove the Processing 'Enabled' row (no such setting). Either merge the Tagging table into the Processing section to reflect the nested 'Tag Embedding' UI, or note that Tagging settings appear within Post Processing.

### `getting-started/common-setups.mdx` — minor-drift

_This is a Docker Compose examples page (deployment topology), and it holds up well against current code. Image name (narratorr/narratorr:latest), port 3000, and the three volume mount points (/config, /audiobooks, /downloads) all match the Dockerfile and official docker-compose.yml. The Transmission "doesn't support categories" claim matches the adapter (TransmissionClient.supportsCategories = false). The SABnzbd API-key location and the webhook-notification tip anchor (#webhook resolves to the Webhook heading in notifications.mdx) are both valid. None of the major March-2026 feature changes (Hardcover, MAM freeleech, discovery defaults, migration flatten) touch this topology page. The one real gap: every example omits PUID/PGID on the narratorr service, even though the narratorr image is a LinuxServer.io/s6 base that defaults to UID/GID 911 — which breaks file permissions on the shared download/library volumes that these stacks depend on._

- **[MISSING/medium]** common-setups.mdx — all four compose examples, the narratorr service block (e.g. lines 15-25, 67-76, 113-122, 149-159) — The narratorr service in every example omits PUID/PGID env vars, while the download-client services (qBittorrent/SABnzbd/Transmission) all set PUID=1000/PGID=1000. The narratorr image is a LinuxServer.io / s6-overlay base that defaults to UID/GID 911 when PUID/PGID are unset. With narratorr running as 911 and the download client running as 1000 on the SHARED /data/downloads and /data/audiobooks volumes, narratorr may be unable to read completed downloads or write imported books to the library — defeating the entire purpose of these stacks. The official docker-compose.yml and README both prominently set PUID/PGID on the narratorr service.
  - _evidence:_ Dockerfile uses linuxserver.io base + s6-overlay (README.md:20). Official compose sets the narratorr service's PUID=1000/PGID=1000 with '# default: 911' (docker-compose.yml:20-21). README.md:35-36 documents '# Container process UID (default: 911)'. The s6-service test asserts PUID/PGID are present in the compose (docker/s6-service.test.ts:239-242). The doc's narratorr service block has no environment section at all, yet sets PUID=1000 on every download-client service it pairs with.
  - _fix:_ Add an `environment:` block with `- PUID=1000` and `- PGID=1000` to the narratorr service in each example (matching the PUID/PGID already set on the download-client services so all containers share the same ownership on /data/downloads and /data/audiobooks). Optionally add a one-line note in 'Key points' explaining that narratorr defaults to UID/GID 911 and must match the download client's UID/GID for the shared-volume import flow to work.

### `getting-started/first-run.mdx` — significant-drift

_The first-run walkthrough has correct step ordering and a valid overall flow (auth → library → indexer → download client → search → add → grab → monitor), and the import troubleshooting tip is accurate. But several concrete navigation/feature claims are wrong or stale: it points to a non-existent "Settings > Library" tab (library config lives under General), omits MyAnonamouse (a first-class indexer type and the primary audiobook tracker), misrepresents Prowlarr as an in-app "import" option (Prowlarr actually pushes indexers TO narratorr via the Readarr-compat shim), and frames auth as a setup-wizard choice without disclosing that auth ships OFF by default — the single most important fact the in-app welcome modal flags with a red warning._

- **[WRONG/high]** Step 2 — "Configure your library path" (line 23) — Doc says "Go to Settings > Library" — there is no Library settings tab.
  - _evidence:_ The settings nav registry has exactly: General, Post Processing, Indexers, Download Clients, Search, Notifications, Blacklist, Security, Import Lists, System (src/client/pages/settings/registry.ts:35-46). Library path is configured under the General tab: GeneralSettings renders <LibrarySettingsSection/> as its first section (src/client/pages/settings/GeneralSettings.tsx:35). SettingsLayout.test.tsx:53-62 enumerates the real nav targets and contains no /settings/library route.
  - _fix:_ Change "Go to Settings > Library" to "Go to Settings > General" (the library path field is the first section there). Note the in-app WelcomeModal also has this same wrong "Settings → Library" label (WelcomeModal.tsx:157) — file an app bug too, but the docs should match the real nav.

- **[MISSING/high]** Step 3 — "Add an indexer" (lines 28-31) — MyAnonamouse (MAM) is omitted from the indexer-type list, despite being a first-class adapter and the primary private audiobook tracker.
  - _evidence:_ INDEXER_TYPES includes 'myanonamouse' with label 'MyAnonamouse' (src/shared/indexer-registry.ts:77) and a dedicated adapter factory (src/core/indexers/registry.ts:29-37, MyAnonamouseIndexer). The four real types are newznab, torznab, myanonamouse, abb (src/shared/schemas/indexer.ts:65-70). Project memory confirms MAM is the go-to audiobook tracker.
  - _fix:_ Add "MyAnonamouse (MAM)" to the indexer-type bullet list, e.g. "MyAnonamouse — direct integration with the MAM private audiobook tracker (mam_id + freeleech-wedge support)."

- **[WRONG/medium]** Step 3 — "Prowlarr import — if you already use Prowlarr, sync your indexers in one step" (line 28) — Misrepresents the Prowlarr integration. There is no in-app "Prowlarr import" pick-one option in the Add Indexer flow, and the sync direction is backwards.
  - _evidence:_ IndexersSettings is a generic CRUD page with a single "Add Indexer" button and no Prowlarr-import affordance (src/client/pages/settings/IndexersSettings.tsx). Prowlarr integration works the OTHER direction: you register narratorr inside Prowlarr as a Readarr-impersonating app, and Prowlarr pushes indexers to narratorr via the compat shim (src/server/routes/prowlarr-compat.ts; readarrBodySchema). Pushed indexers show as prowlarrManaged (read-only) in narratorr's UI (src/client/components/settings/IndexerFields.tsx:16, prowlarrManaged prop).
  - _fix:_ Reframe: Prowlarr is not an indexer type you add inside narratorr. Instead, in Prowlarr add narratorr as an application (it impersonates Readarr's API) and Prowlarr syncs your indexers into narratorr automatically. Link to the Indexers config page for the setup direction.

- **[STALE/medium]** Step 1 — "Set up authentication" (lines 14-19) — Frames auth as a setup-wizard choice but never states that authentication ships DISABLED by default — the most important first-run security fact — and labels Forms as the effective default with "(recommended)".
  - _evidence:_ Fresh installs initialize auth with mode: 'none' (src/server/services/auth.service.ts:86). The app's own first-run WelcomeModal leads with a red-badged warning card titled "Authentication is off — Auth is disabled by default. Enable it in Settings → Security" (src/client/components/WelcomeModal.tsx:146-152). The doc's flow implies the user is prompted to choose a mode; in reality they must proactively go turn auth on.
  - _fix:_ Open step 1 by stating auth is OFF by default on a fresh install and that enabling it (Forms recommended) is your first action. Mirror the welcome-modal warning so the docs and in-app messaging agree.

- **[STALE/low]** Step 3 — "AudioBookBay — direct scraper (may require FlareSolverr)" (line 31) — Lists AudioBookBay as a normal option without the heavy reliability caveat. ABB breaks constantly due to Cloudflare and is the least reliable source.
  - _evidence:_ ABB adapter exists (src/core/indexers/abb.ts, hostname default 'audiobookbay.lu', requires flareSolverrUrl) but project guidance flags it as unreliable: "AudioBookBay (ABB) is NOT Torznab and breaks constantly due to Cloudflare. Don't dev against ABB." The setting list presents it on equal footing with Torznab/Newznab.
  - _fix:_ Keep ABB in the list but add a caveat that it is a best-effort Cloudflare-gated scraper that often needs FlareSolverr and may be unreliable; recommend Torznab/Newznab/MAM as primary sources.

### `getting-started/installation.mdx` — minor-drift

_The installation page is structurally sound and accurate on the load-bearing claims: the Docker image name (narratorr/narratorr:latest), volume mounts (/config, /audiobooks, /downloads), port 3000, CONFIG_PATH, DATABASE_URL, and the manual build/start flow (pnpm install/build → node dist/server/index.js) all match the Dockerfile, docker-compose.yml, tsup.config.ts, config.ts, and package.json. One clear factual error: the git clone URL uses the wrong GitHub org (todd vs the actual tjiddy). Two material omissions in the Docker examples (PUID/PGID and TZ) that the project's own canonical compose file and README both document — partially mitigated because the page links to the Environment Variables reference. The major March-2026 feature changes (Hardcover series, MAM freeleech, discovery defaults, security hardening, migration flatten) are out of scope for this page and correctly absent._

- **[WRONG/high]** Manual Install (From Source) > step 1, line 83: git clone https://github.com/todd/narratorr.git — The clone URL points to the wrong GitHub org/account. It says github.com/todd/narratorr but the project's actual repository is github.com/tjiddy/narratorr. Users following this step will hit a nonexistent or wrong repo.
  - _evidence:_ git remote origin is https://github.com/tjiddy/narratorr.git. The project's own README.md:56 and CONTRIBUTING.md:8 both use https://github.com/tjiddy/narratorr.git. The Layout.tsx:81 SECURITY.md link also uses github.com/tjiddy/narratorr.
  - _fix:_ Change line 83 to: git clone https://github.com/tjiddy/narratorr.git

- **[MISSING/medium]** Docker (Recommended) > Docker Compose / Docker CLI examples (lines 21-53) and Environment Variables section (line 70-72) — The Docker examples omit PUID/PGID. The production image is built on the linuxserver.io base with s6-overlay and runs the app as a fixed user/group (default 911). On self-hosted *arr deployments, PUID/PGID is the standard knob for matching host file ownership on the mounted /config, /audiobooks, and /downloads volumes; omitting it commonly produces permission-denied issues that the install page should pre-empt. The project's canonical docker-compose.yml and README both surface PUID/PGID prominently with the default-911 note.
  - _evidence:_ Dockerfile:40 (FROM ghcr.io/linuxserver/baseimage-alpine:3.21), docker/root/.../svc-narratorr/run:11-12 runs via s6-setuidgid abc. docker-compose.yml:20-21 documents '- PUID=1000 # Set container process UID (default: 911)' and PGID. README.md:35-36 documents the same with '(default: 911)'.
  - _fix:_ Add PUID and PGID to both the Docker Compose and Docker CLI examples (e.g. environment PUID=1000 / PGID=1000 with a note that the image defaults to 911), matching docker-compose.yml, and add a one-line callout that these control file ownership on the mounted volumes.

- **[MISSING/low]** Docker (Recommended) > example compose/CLI (lines 21-53) — The compose/CLI examples omit the TZ environment variable. The canonical docker-compose.yml sets TZ, which controls timezone for scheduled jobs (monitor/RSS cron, retention) and log timestamps. A new user copying the doc example gets UTC silently.
  - _evidence:_ docker-compose.yml:16 sets '- TZ=America/New_York'. The image's scheduling (MONITOR_INTERVAL_CRON default in config.ts:32-35) and Pino log timestamps render in container TZ.
  - _fix:_ Add '- TZ=America/New_York' (with a comment to set the operator's timezone) to the compose example, or mention TZ in the Environment Variables note pointing at the reference page.

### `guides/audio-processing.mdx` — significant-drift

_The page describes audio processing as an automatic import-time pipeline driven by an "Enabled" master toggle, an "Output Format" (m4b/mp3) choice, and a "Merge Behavior" selector. The current code tells a different story: there is no automatic post-import processing and no "Enabled" toggle. Processing is manually triggered — a per-book "Merge" operation (MergeService) or a bulk "Convert" job (BulkOperationService) — both of which run only on books already imported. Critically, both real callers hardcode outputFormat:'m4b' and mergeBehavior:'always', so the documented "Output Format" and "Merge Behavior" settings are stored/shown in the UI but never actually applied (the mp3 option and the multi-file-only/never behaviors are unreachable through these settings). The settings section is titled "Post Processing" at /settings/post-processing, not "Processing". The page also omits several real settings on that page (Max Concurrent Jobs, Custom/Post-Processing Script + timeout, Tag Embedding). The ffmpeg-path, bitrate range/default, and Docker auto-detect claims are accurate. Health is significant-drift: the central workflow model and two of the headline settings are wrong, though the ffmpeg/bitrate basics hold._

- **[WRONG/high]** Settings table, row 'Enabled' (line 19) — The page claims a 'Enabled' master toggle for all audio processing exists. There is no such setting.
  - _evidence:_ processingSettingsSchema (src/shared/schemas/settings/processing.ts:9-18) has no `enabled` field; registry defaults (src/shared/schemas/settings/registry.ts:54-67) define no `enabled` key; the UI form (src/client/pages/settings/ProcessingSettingsSection.tsx) renders no master toggle; settings.service.test.ts:537 explicitly asserts bootstrap writes 'no enabled key'. Processing is gated by whether ffmpegPath is set, not by a toggle.
  - _fix:_ Delete the 'Enabled' row. Replace with a note that processing runs only when an ffmpeg path is configured, and is invoked manually (per-book Merge or bulk Convert), not via a master switch.

- **[WRONG/high]** 'How It Works' section (lines 36-42) — Describes audio processing as an automatic step in the import pipeline ('A download completes... Narratorr begins the import process... If processing is enabled... ffmpeg combines... placed in the library folder'). No automatic import-time processing exists.
  - _evidence:_ processAudioFiles (src/core/utils/audio-processor.ts:88) is called only from MergeService (src/server/services/merge.service.ts:289) and BulkOperationService.convertBook (src/server/services/bulk-operation.service.ts:326). import.service.ts never calls it (grep for processAudioFiles/merge/audio-processor in import.service.ts returns nothing). MergeService.validateBookForMerge requires book.status === 'imported' (merge.service.ts:109) — i.e. processing happens AFTER import, on demand. The Post Processing settings UI description literally reads 'Audio file merge and conversion for Merge and Bulk operations' (ProcessingSettingsSection.tsx:174).
  - _fix:_ Rewrite 'How It Works' to: import places files as-is; the user then triggers a per-book Merge from the book page (queued, semaphore-limited, with progress) or a bulk Convert job from settings. Merge copies files to a staging dir, runs ffmpeg, verifies the output, then swaps it into the book folder and deletes originals.

- **[WRONG/high]** Settings table, 'Output Format' row (line 21) and 'Merge Behavior' section (lines 26-34) — The page presents 'Output Format' (m4b/mp3) and 'Merge Behavior' (Always/Multi-file only/Never) as functional controls that govern processing. Both settings are stored and shown in the UI but are never actually applied — both server callers hardcode m4b and always.
  - _evidence:_ MergeService.runStaging passes literal `outputFormat: 'm4b'` and `mergeBehavior: 'always'` to processAudioFiles (merge.service.ts:291,294). BulkOperationService.convertBook does the same (bulk-operation.service.ts:330-331). Grep for `processing.outputFormat`/`processing.mergeBehavior` reads in src/server returns no matches — neither setting is ever read server-side to drive ffmpeg. So selecting mp3, or 'Multi-file only'/'Never', has no effect on actual output (always M4B, always merged when >=2 files).
  - _fix:_ Either (a) document that these two settings are currently inert / reserved and output is always M4B (merge always combines), or (b) flag for an engineering fix to thread settings.processing.outputFormat / mergeBehavior into MergeService and BulkOperationService. Until then, remove the bitrate/format/merge-behavior tables' implication that mp3 and the merge-behavior options are live.

- **[WRONG/medium]** Merge Behavior table, 'Always' row (line 30) — Claims 'Always' merges all files into a single output 'even single-file downloads'. The manual Merge operation requires at least 2 top-level audio files and rejects single-file books.
  - _evidence:_ MergeService.validateBookForMerge throws MergeError('No top-level audio files to merge (requires >=2)', 'NO_TOP_LEVEL_FILES') when topLevelAudioFiles.length < 2 (merge.service.ts:112-114); the same check exists at dequeue time (merge.service.ts:204-206). The audio-processor also short-circuits a single existing .m4b as already-ready (audio-processor.ts:101-103).
  - _fix:_ State that Merge operates only on books with >=2 audio files; single-file books are skipped/rejected. Drop the 'even single-file downloads' claim.

- **[WRONG/medium]** 'Keep Original Bitrate' (lines 22, 56) and Bitrate Guidance closing paragraph (line 56) — Says keep-original 'preserves the source bitrate' so you avoid 're-encoding losses'. In reality the file is still re-encoded (to AAC/MP3); only the target bitrate cap is dropped, so source-bitrate re-encode still happens.
  - _evidence:_ audio-processor always encodes with -c:a aac (m4b) or libmp3lame (mp3) (audio-processor.ts:290-294, 375); there is no copy-codec path for merge. The UI itself says 'Files will be re-encoded using the original source bitrate.' (ProcessingSettingsSection.tsx:247). When keepOriginalBitrate is on, merge passes targetBitrateKbps = undefined (merge.service.ts:281), which only removes the bitrate cap.
  - _fix:_ Correct the wording: keep-original drops the target-bitrate cap and re-encodes at (up to) the source bitrate; it is not a lossless copy and does not avoid re-encoding. Also note the codebase caps effective bitrate at min(source, target) to prevent upsampling (audio-processor.ts:286-288).

- **[STALE/low]** All 'Settings > Processing' references (lines 11, 15, 60) — The settings location is referred to as 'Settings > Processing'. The actual section is titled 'Post Processing' and lives at /settings/post-processing.
  - _evidence:_ SettingsSection title is 'Post Processing' (ProcessingSettingsSection.tsx:173); the page file is PostProcessingSettings.tsx and the route is '/settings/post-processing' (HealthDashboard.test.tsx:159,174). Tests assert getByText('Post Processing').
  - _fix:_ Update all references to 'Settings > Post Processing'.

- **[MISSING/medium]** Settings table (lines 17-24) — The page omits three real, user-facing settings on the Post Processing page: Max Concurrent Jobs, the Custom/Post-Processing Script, and Script Timeout.
  - _evidence:_ processingSettingsSchema defines maxConcurrentProcessing (min 1, default 2), postProcessingScript (default ''), postProcessingScriptTimeout (min 1, default 300) (processing.ts:15-17; registry.ts:62-64). The UI renders 'Max Concurrent Jobs' (ProcessingSettingsSection.tsx:266-276) and a 'Custom Script' block with NARRATORR_BOOK_TITLE/AUTHOR/IMPORT_PATH/IMPORT_FILE_COUNT env vars and a required-when-set timeout (lines 77-108, superRefine 29-37).
  - _fix:_ Add rows for Max Concurrent Jobs (default 2), Post-Processing Script (absolute path run after each successful import, with the documented NARRATORR_* env vars), and Script Timeout (seconds, default 300, required when a script is set).

- **[MISSING/low]** Settings section (lines 13-24) — The Tag Embedding feature lives on this same Post Processing page (Tag Embedding toggle, Tag Mode populate-missing/overwrite, Embed Cover Art) and is not mentioned here at all.
  - _evidence:_ ProcessingSettingsSection.tsx:279-318 renders taggingEnabled, tagMode (TAG_MODE_LABELS), and embedCover controls; toPayload writes them to settings.tagging (lines 69-73). Tagging requires ffmpeg ('Requires ffmpeg', line 284).
  - _fix:_ Add a short subsection noting that Tag Embedding (write metadata into audio tags on import, with a populate-missing/overwrite mode and cover-art embedding) is configured on the same page and also depends on ffmpeg — or cross-link to a tagging guide if one exists.

### `guides/backup-restore.mdx` — minor-drift

_The page is largely accurate against current code: backup interval (60–43200, default 10080), retention (1–100, default 7), the Settings > System location, VACUUM-INTO whole-DB snapshot, the two-step upload→confirm restore with a 5-minute pending window, the migration-count "newer version" rejection, and the restart-to-apply behavior all match src/server/services/backup.service.ts, src/shared/schemas/settings/system.ts, src/server/routes/system.ts, and the System settings UI. Two real gaps: (1) the migration FLATTEN (single 0000 baseline) means pre-flatten 0.x backups now have MORE migrations than the current app and are rejected by the exact "newer version" check the doc describes — a material trap the page never warns about; (2) the page documents only the upload-restore path and omits the one-click "restore from an existing server-side backup" flow now in the Backups list. A couple of minor framing nits on UI labels._

- **[MISSING/high]** Restoring from Backup, step 1 (lines 45-48): "Verifies the migration count is compatible (can't restore a backup from a newer version)" — The page never warns that the migration flatten makes pre-flatten (0.x) backups un-restorable. After the single-0000 baseline flatten, the live app has exactly ONE migration. A backup taken from a pre-flatten build has many migrations (dozens), so backupMigrationCount > appMigrationCount and the restore is rejected as 'from a newer version' — even though it is actually an OLDER backup. Anyone with a pre-1.0 backup hits a confusing, undocumented wall.
  - _evidence:_ drizzle/meta/_journal.json has a single entry (idx 0, tag '0000_perpetual_supernaut'). backup.service.ts:347-353 rejects when `backupMigrationCount > appMigrationCount` with the message 'This backup is from a newer version.' getAppMigrationCount (backup.service.ts:68-79) counts rows in __drizzle_migrations, which is now 1 post-flatten. A pre-flatten backup's count exceeds 1 → rejected.
  - _fix:_ Add a caution box stating that backups created before the 1.0 migration flatten will fail validation with a 'newer version' error and cannot be restored into 1.0+, because the migration history was reset to a single baseline. Advise users to migrate off pre-flatten versions before relying on backups, or note this is expected one-time breakage.

- **[MISSING/medium]** Restoring from Backup (lines 41-50) — describes only the Upload path — The page documents restore exclusively as 'upload a backup zip file,' but the Backups list now has a per-row Restore action that validates and stages an existing server-side backup directly (no re-upload needed). This is the primary restore flow for backups already living in config/backups/, and it is undocumented.
  - _evidence:_ BackupTable.tsx:68-75 renders a per-row Restore button (title 'Restore backup') calling onRestore. SystemSettings.tsx:97-113 wires it to api.restoreBackupDirect → POST /api/system/backups/:filename/restore (system.ts:137-158), which calls backup.service.ts restoreServerBackup (lines 309-326). Same validate→confirm flow, but sourced from a listed backup rather than an upload.
  - _fix:_ Add a short note that you can restore directly from any backup shown in the Backups list via its Restore (history) icon — it runs the same validate→confirm flow as upload, without needing to re-upload the file. Reserve the Upload path for restoring an off-site/downloaded backup.

- **[MISSING/low]** Restoring from Backup (line 45) — "Narratorr extracts and validates it" — The page omits the uncompressed-size cap on restore extraction. The extracted narratorr.db is capped at 1 GB; exceeding it aborts the restore with an OVERSIZED_DB / 'possible zip bomb' error. A user with a legitimately large (>1 GB) database would hit this and have no documented explanation.
  - _evidence:_ backup.service.ts:15-16 (MAX_UNCOMPRESSED_DB_SIZE = BYTES_PER_GB) and lines 239-249 reject when bytesWritten exceeds the cap with RestoreUploadError code 'OVERSIZED_DB'. The cap is configurable via the maxRestoreDbSize constructor arg but defaults to 1 GB.
  - _fix:_ Add a one-line note that restore extraction is capped at 1 GB of uncompressed database to guard against malformed/zip-bomb uploads, so very large databases may need the cap raised.

- **[STALE/low]** Manual Backup (line 35) and Downloading Backups (line 39): "System > Backups > Create Backup" / "From System > Backups" — Navigation breadcrumb framing is slightly off. There is no 'Backups' sub-page; the controls live in the System settings tab under a section titled 'Backup & Restore' (with a separate 'Backup Schedule' section above it). The button label 'Create Backup' is correct, but 'System > Backups' implies a sub-navigation that doesn't exist.
  - _evidence:_ registry.ts:45 defines the tab as { path: 'system', label: 'System' }. SystemSettings.tsx:155-159 renders the SettingsSection titled 'Backup & Restore' containing the 'Create Backup' button (line 168). The schedule lives in BackupScheduleForm titled 'Backup Schedule'.
  - _fix:_ Reword to 'Settings > System > Backup & Restore' (matching the actual section title) for both the manual-backup and download instructions; the schedule fields are under the 'Backup Schedule' section on the same tab.

### `guides/blacklist.mdx` — minor-drift

_The blacklist page is mostly accurate on the substance: the temporary/permanent model, TTL setting (default 7, range 1-365), auto-blacklisting on quality-gate rejection, expiry-aware search filtering, and automatic cleanup of expired entries all match current code. Three location/flow claims are wrong: the blacklist UI lives under Settings > Blacklist (not "System > Blacklist or the Activity page"), the management page has no add/create UI (manual blacklisting is done from the search/releases modal), and the reasons table omits one of the eight current reasons (user_cancelled)._

- **[WRONG/medium]** Managing the Blacklist (line 46): "The blacklist is accessible from **System > Blacklist** (or the Activity page)." — Both navigation locations are wrong. There is no "System" section in the app, and the blacklist is not on the Activity page. The blacklist is a Settings tab.
  - _evidence:_ src/client/pages/settings/registry.ts:42 registers `{ path: 'blacklist', label: 'Blacklist', icon: ShieldBanIcon, component: BlacklistSettings }` → route `/settings/blacklist`. src/client/components/layout/Layout.tsx:106-115 shows the only nav items are Library, Add Book, Activity, Settings, Discover — no "System". The Activity page (pages/activity/) handles download review/reject, not blacklist viewing.
  - _fix:_ Change to: "The blacklist is managed from **Settings > Blacklist**."

- **[WRONG/medium]** How Releases Get Blacklisted (line 15): "You can also manually add entries from the blacklist management page." — The blacklist management page (Settings > Blacklist) has no add/create UI — it only lists, toggles temporary/permanent, and deletes entries. Manual blacklisting is done from the search/releases modal, not the management page.
  - _evidence:_ src/client/pages/settings/BlacklistSettings.tsx (full file) has no create form — only list, toggleMutation, and deleteMutation. Its empty state (line 95) reads "Blacklist releases from the search modal to prevent them from appearing again." The manual-add action is the Blacklist button on each release card: src/client/components/ReleaseCard.tsx:145 (`onClick={onBlacklist}`) → src/client/components/SearchReleasesModal.tsx:153-165 `handleBlacklist` calls `api.addToBlacklist` with reason 'other'.
  - _fix:_ Replace with: "You can also manually blacklist any release from the search results modal (the Blacklist button on each release card). Entries are recorded with reason 'Other'."

- **[MISSING/low]** Blacklist Reasons table (lines 34-42) — The reasons table lists 7 reasons but the code defines 8 — `user_cancelled` ("User Cancelled") is omitted.
  - _evidence:_ src/shared/schemas/blacklist.ts:7-10 BLACKLIST_REASONS = ['wrong_content','bad_quality','wrong_narrator','spam','other','download_failed','infrastructure_error','user_cancelled']; REASON_LABELS at lines 14-23 maps user_cancelled → 'User Cancelled'.
  - _fix:_ Add a row: `| user_cancelled | User Cancelled — download was cancelled by the user |`

- **[STALE/low]** How It Affects Search (line 55): "Narratorr checks all result info hashes against the active blacklist." — Slightly narrow: the search filter matches on BOTH info hashes (torrents) and NZB GUIDs (Usenet), not just info hashes. The page intro (line 6) already mentions both identifiers, so this sentence reads as an unintended narrowing.
  - _evidence:_ src/server/services/search-pipeline.ts:231-244 `filterBlacklistedResults` collects both `r.infoHash` and `r.guid`, calls `getBlacklistedIdentifiers(hashes, guids)`, and filters on `hashMatch || guidMatch`. Service method src/server/services/blacklist.service.ts:136-174 returns both `blacklistedHashes` and `blacklistedGuids`.
  - _fix:_ Change "checks all result info hashes" to "checks every result's info hash (torrents) and GUID (Usenet)".

### `guides/discovery.mdx` — significant-drift

_The page's core engine description — scoring weights, recency/duration/series bonuses, dismissal-based auto-tuning, and series-gap completion — all match the current code exactly. But four claims have drifted from reality. The Snooze action was retired (Wave 11.2, #755): there is no snooze button in the UI, no snooze API method, the route returns 404, and snoozeDays is never consumed to create a snooze — yet the doc lists Snooze as a primary card action and a lifecycle state. The "Weight Multipliers in Settings" UI does not exist; multipliers are computed automatically by the service and explicitly excluded from the settings form. The "Enabling Discovery / toggle it on" framing is stale since discovery now defaults to enabled. And the expiry claim that refreshing "won't expire" a suggestion is wrong — expiry checks createdAt, which never resets on refresh._

- **[STALE/high]** Actions table (line 70), Setting table row 'Snooze Days' (line 18), Suggestion Lifecycle step 5 'Snoozed' (line 82) — The Snooze action no longer exists in the UI or API. The doc presents Snooze as one of three primary card actions and as a lifecycle state, but the snooze feature was retired (Wave 11.2, #755).
  - _evidence:_ src/client/pages/discover/SuggestionCard.tsx only renders Add (AddBookPopover) and Dismiss buttons — no snooze control (lines 96-124). src/client/lib/api/discover.ts exposes only getDiscoverSuggestions/markDiscoverSuggestionAdded/dismissDiscoverSuggestion/refreshDiscover — no snooze method. src/server/routes/discover.ts has no snooze endpoint; src/server/routes/discover.test.ts:242-245 asserts 'POST /api/discover/suggestions/:id/snooze returns 404' with comment line 235 'Wave 11.2 (#755) — ...POST /api/discover/suggestions/:id/snooze retired'. No service code reads settings.snoozeDays to set snoozeUntil (grep of snoozeDays shows only schema/registry/form usage, never consumed). The snoozeUntil resurfacing plumbing survives in discovery.service.ts but is now unreachable by users.
  - _fix:_ Remove the Snooze row from the Actions table, the 'Snooze Days' setting row, the 'Snoozed' lifecycle step, and the Snooze references in the intro. If desired, add a one-line note that the snooze action was removed. (Optionally flag in a code issue that the orphaned snoozeDays setting + snooze field in DiscoverySettingsSection.tsx should be removed from the UI, since they no longer do anything.)

- **[WRONG/high]** Weight Multipliers section (lines 44-46) — The doc says each reason category has a weight multiplier editable in 'Settings > Discovery > Weight Multipliers' and that you can lower it or 'set it to 0 to exclude it entirely.' No such UI control exists — weightMultipliers are computed automatically by the service and are explicitly excluded from the settings form.
  - _evidence:_ src/shared/schemas/settings/discovery.ts:22-27 comment: 'Form schema ... excluding weightMultipliers — it's computed by DiscoveryService during refreshes, not editable in the Discovery settings form'; discoveryFormSchema.pick(...) omits weightMultipliers. src/client/pages/discover/DiscoverySettingsSection.tsx renders only enabled/intervalHours/maxSuggestionsPerAuthor/expiryDays/snoozeDays — no multiplier inputs. Multipliers are derived in discovery.service.ts:116-127 via computeWeightMultipliers from dismissal stats, then persisted to settings programmatically.
  - _fix:_ Rewrite the section to state that weight multipliers are NOT user-configurable — they are computed automatically from your dismissal patterns each refresh cycle. Remove the 'Settings > Discovery > Weight Multipliers' reference and the 'set it to 0 to exclude' instruction. Keep the auto-tuning paragraph (it is accurate: >80% dismissed with >=5 samples reduces the multiplier down to a 0.25 floor — discovery-weights.ts:15-34).

- **[WRONG/medium]** Suggestion Lifecycle, final paragraph (line 85) — The doc claims a refreshed suggestion 'won't expire while the engine still considers it relevant' because the refresh timestamp is reset. Expiry is computed from createdAt, not refreshedAt, so continued refreshing does NOT prevent expiry — a suggestion still expires expiryDays after it was first created.
  - _evidence:_ src/server/services/discovery.service.ts:174-176 expireSuggestions uses 'lt(suggestions.createdAt, cutoff)' where cutoff = now - expiryDays. The refresh path resets refreshedAt (line 237, 246) but never touches createdAt. The suggestions table has separate created_at and refreshed_at columns (src/db/schema.ts:386-393).
  - _fix:_ Correct the sentence: on refresh, an existing suggestion (matched by ASIN) has its score updated and refreshedAt reset, but expiry is measured from the original createdAt — so a suggestion that keeps reappearing will still expire expiryDays after it was first generated. The ASIN-match upsert claim itself is correct (onConflictDoUpdate target: suggestions.asin).

- **[STALE/medium]** Enabling Discovery section (lines 8-10) — The 'Go to Settings > Discovery and toggle it on' framing implies discovery is off by default and must be enabled. Discovery now defaults to ENABLED.
  - _evidence:_ src/shared/schemas/settings/discovery.ts:12 'enabled: z.boolean().default(true)' and src/shared/schemas/settings/registry.ts:99 defaults '{ enabled: true, ... }'.
  - _fix:_ Reframe: Discovery is enabled by default. Note it can be turned off (or its interval/limits adjusted) under Settings > Discovery, rather than instructing the user to turn it on.

- **[STALE/low]** Actions table, 'Add' row (line 68) — The doc says Add 'Adds the book to your library as "wanted" and starts searching.' Adding as 'wanted' is correct, but searching is not automatic — the Add control is a popover with a 'Search immediately' checkbox that defaults to the user's quality setting (which itself defaults to false).
  - _evidence:_ src/client/pages/discover/SuggestionCard.tsx:109-112 renders AddBookPopover. src/client/components/AddBookPopover.tsx:57-60,126-134 shows a 'Search immediately' checkbox where searchImmediately = searchOverride ?? quality.searchImmediately ?? false. books default to status 'wanted' (src/db/schema.ts:52-56).
  - _fix:_ Clarify that Add opens a popover that adds the book as 'wanted' and lets you optionally search immediately (checkbox defaults to your Quality > Search Immediately setting), rather than stating it always starts searching.

### `guides/docker.mdx` — significant-drift

_The page's Docker scaffolding (volume layout, networking, /api/health endpoint, image name narratorr/narratorr:latest, update flow) is accurate. But it describes the image's runtime user model incorrectly and is missing the LinuxServer.io conventions the actual image ships with. The image is now LSIO-baseimage-alpine-based and runs Node as the unprivileged 'abc' user via s6-overlay (s6-setuidgid abc), controlled by PUID/PGID env vars (LSIO default 911) — NOT as root, which directly contradicts the Common Issues claim. The official docker-compose.yml ships PUID/PGID and TZ env vars that the page never mentions, and the in-image HEALTHCHECK uses curl (respecting URL_BASE) rather than the wget example shown. These omissions matter because the page's own "container can't write to volumes" troubleshooting tip points operators at the wrong fix._

- **[WRONG/high]** Common Issues — "Container can't write to volumes" bullet (line 129) — Claims "Narratorr runs as root in the default image." The image is LinuxServer.io-based and runs Node as the unprivileged 'abc' user via s6-overlay, not root. File-permission problems are fixed by matching PUID/PGID to the host owner — not by assuming a root process.
  - _evidence:_ Dockerfile:40 runner stage is `FROM ghcr.io/linuxserver/baseimage-alpine:3.21`. docker/root/etc/s6-overlay/s6-rc.d/svc-narratorr/run:10-17 execs node under `s6-setuidgid abc` (the LSIO user). docker-compose.yml:20-21 sets `PUID=1000`/`PGID=1000` with comment "default: 911". The s6-service.test.ts asserts `su-exec is NOT installed` and `run script uses s6-setuidgid abc for LSIO user model`.
  - _fix:_ Replace with: "Narratorr runs as the unprivileged 'abc' user (LinuxServer.io base image). Set PUID/PGID to match the UID/GID that owns your host directories (default 911). Run `id` on the host to find the right values."

- **[MISSING/high]** Networking / docker-compose examples and Environment Variables section (lines 16-22, 33-43, 123-125) — The page never mentions PUID, PGID, or TZ — the LinuxServer.io env vars the official docker-compose.yml ships and that govern file ownership of everything Narratorr writes (config DB, imported audiobooks). Without these, operators hit permission errors on /config, /audiobooks, and /downloads with no guidance.
  - _evidence:_ docker-compose.yml:16-22 sets `TZ=America/New_York`, `PUID=1000`, `PGID=1000` with inline comments documenting the 911 default. docker/s6-service.test.ts:239-243 enforces that compose includes PUID and PGID. None of these appear anywhere in docker.mdx.
  - _fix:_ Add PUID/PGID/TZ to the compose snippets and document them in a short list: PUID/PGID set the runtime UID/GID for file ownership (default 911, set to match host directory owner); TZ sets the container timezone for logs and scheduling. Reference them from the volume-permissions troubleshooting bullet.

- **[WRONG/medium]** Health Check section — healthcheck YAML example (lines 83-88) — The example uses `wget --spider` and a hardcoded `/api/health` path. The actual in-image HEALTHCHECK uses `curl -sf` and prefixes the path with `${URL_BASE:-}` so it works under a reverse-proxy subpath. A copied wget example would also fail to honor URL_BASE deployments and is inconsistent with what the image already does out of the box.
  - _evidence:_ Dockerfile:78-79 — `HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -sf http://localhost:3000${URL_BASE:-}/api/health || exit 1`. docker/healthcheck.test.ts:40-44 asserts the Dockerfile `uses curl -sf` and `not wget`.
  - _fix:_ Note that the image already defines a HEALTHCHECK (no manual config needed). If showing an example, use `curl -sf http://localhost:3000${URL_BASE:-}/api/health` to match the image and support subpath deployments, and mention the built-in start-period.

- **[MISSING/low]** Volumes / image overview (lines 6-25) — The production image bundles ffmpeg specifically for audio post-processing (M4B conversion, chapter embedding, cover-art embedding). Operators sizing the image or debugging post-processing won't know ffmpeg is present and intentional.
  - _evidence:_ Dockerfile:46-47 — `# Install ffmpeg (LSIO base does not include it)` / `RUN apk add --no-cache ffmpeg`. docker/s6-service.test.ts:128-131 enforces `ffmpeg is installed in runner image`.
  - _fix:_ Add a one-line note that the image ships ffmpeg for audio post-processing (M4B conversion, chapters, cover embedding), so no external ffmpeg install is required.

### `guides/features.mdx` — significant-drift

_The Features Reference page is broadly structurally accurate but carries two material discrepancies and several omissions. The biggest issue is the "Prowlarr Sync" section, which documents a UI-driven pull flow (Settings > Indexers > Prowlarr Sync, Preview/Apply) that does not exist in the codebase — narratorr's actual Prowlarr integration is the reverse direction (a Readarr-compat endpoint that Prowlarr pushes indexers into), and a client test explicitly asserts no Prowlarr import button/modal renders. Second, the Event History table lists `upgraded`, which is an explicitly removed event type (a test asserts the schema rejects it), and omits six event types that the code actually emits. The Health Checks table omits the new Hardcover check. Post-processing script env vars, search interval default (360), SSE event names, Activity page pending_review flow, Author page, and pagination claims all verify correctly against current code._

- **[STALE/high]** ## Prowlarr Sync (lines 58-67) — The entire Prowlarr Sync section describes a UI-driven pull/sync flow that does not exist in the codebase: "Go to Settings > Indexers > Prowlarr Sync", enter URL + API key, "Click Preview to see what would be synced", "Select the items to sync and click Apply". There is no such UI, no preview/apply client API methods, and no pull-based sync route/service.
  - _evidence:_ No client-side Prowlarr sync API exists — grep for syncIndexers/previewSync/prowlarrSync in src/client/lib/api returns no matches. src/client/pages/settings/IndexersSettings.test.tsx:72-78 explicitly asserts the Prowlarr import button and 'Import from Prowlarr' modal do NOT render. The only Prowlarr integration is the reverse direction: src/server/routes/prowlarr-compat.ts is a Readarr-API-impersonation shim (mounted at routes/index.ts:308) that lets Prowlarr PUSH indexers into narratorr — you add narratorr as a Readarr 'app' inside Prowlarr, and Prowlarr's app-sync writes indexers via POST/PUT to narratorr's /api/v1/indexer compat endpoints. The `prowlarr` SecretEntity (secret-codec.ts:42) is vestigial — there is no `prowlarr` settings schema category in src/shared/schemas/settings.
  - _fix:_ Rewrite the Prowlarr Sync section to describe the actual flow: narratorr exposes a Readarr-compatible API (the Prowlarr-compat shim). To sync, add narratorr as a Readarr application in Prowlarr's Settings > Apps, point it at narratorr's URL + API key; Prowlarr then pushes its torznab/newznab indexers into narratorr automatically. Remove the fictional Preview/Apply/in-narratorr-UI steps. Note that narratorr accepts Readarr echo-only fields liberally (Zod .strip(), not .strict()).

- **[WRONG/high]** ## Activity Page > Event History table (line 23) — The Event History table lists `upgraded` ("An existing book was replaced with a higher-quality version") as a valid event type. This event type has been removed from the schema and is never emitted.
  - _evidence:_ src/shared/schemas/event-history.ts:7-17 — eventTypeSchema does NOT include 'upgraded'. src/shared/schemas/event-history.test.ts:67-68 has an explicit test: "rejects the removed upgraded event type" → expect(() => eventTypeSchema.parse('upgraded')).toThrow(). No `eventType: 'upgraded'` create call exists anywhere in src/server.
  - _fix:_ Remove the `upgraded` row from the Event History table.

- **[MISSING/medium]** ## Activity Page > Event History table (lines 16-28) — The Event History table omits six event types that the code actually emits, so the documented list is materially incomplete.
  - _evidence:_ Emitted in src/server but not in the doc table: `merged`/`merge_started`/`merge_failed` (merge.service.ts:68,74,85), `wrong_release` (book-rejection.service.ts:103), `book_added` (books.ts:154, import-orchestration.helpers.ts:158, library-scan), `metadata_fixed` (books-fix-match.ts:121), `grab_failed` (download-side-effects.ts:219, emitted when an auto-grab fails). All are present in eventTypeSchema (event-history.ts:7-17).
  - _fix:_ Add rows for the merge events (merge_started/merged/merge_failed), wrong_release (release rejected as wrong match), book_added (a book record was created, e.g. via library scan or manual add), metadata_fixed (book metadata was corrected via fix-match), and grab_failed (sending a release to the download client failed). Alternatively note the table lists the most common events and is not exhaustive.

- **[MISSING/medium]** ## Health Checks table (lines 73-81) — The Health Checks table omits the Hardcover check, which is a new check added alongside the Hardcover series-metadata feature.
  - _evidence:_ src/server/services/health-check.service.ts:70 includes checkHardcover() in the runAllChecks list; checkHardcover (lines 268-285) does a live probe of the Hardcover API when a Hardcover API key is configured in metadata settings (skipped when no key). The doc lists only 6 checks; the code runs 7.
  - _fix:_ Add a Hardcover row to the Health Checks table: monitors the Hardcover API connection when a Hardcover API key is configured in Settings > Search > Metadata (skipped if no key set).

- **[STALE/low]** ## Version Check (line 138) — The doc says "Configure in Settings > System > Dismissed Update Version", implying a user-editable settings field. The dismissedUpdateVersion value is managed automatically by the update-check banner's dismiss action, not exposed as an editable field in the System settings form.
  - _evidence:_ src/shared/schemas/settings/system.ts:10-18 — the systemFormSchema explicitly excludes dismissedUpdateVersion with the comment "managed by update-check UI, not the backup schedule form". It is set when the user dismisses the banner, not typed into a settings form.
  - _fix:_ Reword to clarify the dismissal is stored automatically when you dismiss the update banner (it is not a manually edited Settings field). Drop the "Configure in Settings > System > Dismissed Update Version" instruction or reframe it as internal state.

### `guides/folder-format.mdx` — minor-drift

_The core of this page is accurate: all 12 naming tokens, the zero-pad and conditional-suffix modifiers, the defaults, empty-segment skipping, character sanitization, and validation behavior all match current code. I verified every rendered example in the page by executing renderTemplate/renderFilename against current naming.ts — all nine produce the documented output exactly. The drift is in omissions, not wrong claims: the page never mentions three user-facing naming settings that ship in the "File Naming" settings section (Separator, Case, and Presets), and it documents only the suffix form of the prefix/suffix grammar while the app supports conditional-prefix and combined prefix+suffix forms (which the bundled Plex/Audiobookshelf presets actually use). Two small framing nits round it out._

- **[MISSING/high]** Whole page (no section for it); belongs near Modifiers/Behavior Notes — The page never documents the Separator and Case settings, which transform every token's output. A user reading only this page cannot predict their folder/file names, because 'space'/'period'/'underscore'/'dash' and 'default'/'lower'/'upper'/'title' are applied to every non-numeric resolved token value at render time.
  - _evidence:_ src/shared/schemas/settings/library.ts:95-97 defines namingSeparatorSchema (enum space|period|underscore|dash, default 'space') and namingCaseSchema (enum default|lower|upper|title, default 'default'); src/core/utils/naming.ts:42-61 applyTokenTransforms() applies case then separator to every token value; src/client/pages/settings/NamingSettingsSection.tsx:265-270 renders the 'Separator' and 'Case' dropdowns in the UI. registry.ts:35 confirms defaults namingSeparator:'space', namingCase:'default'.
  - _fix:_ Add a 'Separator and Case' subsection documenting the two settings, their option lists (Space/Period/Underscore/Dash; Default/lowercase/UPPERCASE/Title Case), their defaults (space / default), and that they reshape every token value (e.g. period separator turns 'Brandon Sanderson' into 'Brandon.Sanderson' and collapses 'Last, First' commas).

- **[MISSING/medium]** Modifiers section (only Zero-Pad, Conditional Suffix, Combined are documented) — The grammar supports a conditional-PREFIX form {text?token} and a combined prefix+suffix form {pre?token?suf}, but the page documents only the suffix form. This is not academic: the bundled Plex preset uses '{ - pt?trackNumber:00}' (prefix) and users copying preset-style templates will hit undocumented syntax.
  - _evidence:_ src/shared/naming-constants.ts:34-47 TOKEN_PATTERN_SOURCE documents all five forms incl. '{text?name}' and '{text?name?text}'; src/core/utils/naming.ts:154-189 disambiguateTokenMatch implements prefix vs suffix precedence; src/core/utils/naming-presets.ts:25 Plex fileFormat is '{title}{ - pt?trackNumber:00}'; the in-app NamingTokenModal (src/client/components/settings/NamingTokenModal.tsx:103-110) explicitly lists '{text?token}' Conditional prefix and '{pre?token?suf}' Both prefix and suffix.
  - _fix:_ Add a 'Conditional Prefix: {text?token}' subsection and a 'Prefix + Suffix: {pre?token?suf}' note. Include the disambiguation rule from the modal (NamingTokenModal.tsx:123): if the text before '?' is a known token name it's treated as a suffix, otherwise as a prefix.

- **[MISSING/low]** Defaults / top-of-page intro — The page omits the Presets dropdown that lets users pick Standard, Audiobookshelf, Plex, or 'Last, First' format pairs without hand-writing templates — the primary onboarding path for naming.
  - _evidence:_ src/core/utils/naming-presets.ts:8-33 defines NAMING_PRESETS (standard, audiobookshelf, plex, last-first) with their folder/file formats; src/client/pages/settings/NamingSettingsSection.tsx:261-264 renders the Preset selector.
  - _fix:_ Add a short 'Presets' note listing the four built-in presets and their folder/file format pairs, noting that selecting one populates both format fields and that editing afterward shows 'Custom'.

- **[STALE/low]** Line 6: 'Configure these in Settings > Library.' — Naming/format settings live in a distinct 'File Naming' section, not the 'Library' section (which now holds only the Library Path). 'Settings > Library' undersells where to find these and where the new Separator/Case/Preset controls are.
  - _evidence:_ src/client/pages/settings/NamingSettingsSection.tsx:258 titles the section 'File Naming' (description 'Configure how audiobook files and folders are named'); src/client/pages/settings/GeneralSettings.tsx:35-37 shows LibrarySettingsSection and NamingSettingsSection as separate sections; GeneralSettings.test.tsx:71 asserts 'renders File Naming section after Library section'.
  - _fix:_ Change to 'Configure these in Settings under the File Naming section' (it sits just below Library on the General settings page).

- **[WRONG/low]** Line 49 table row: `{year? (}{year?)}` | 'See combined example below' | (nothing) — The cell points to a 'combined example below' that does not exist on the page — there is no worked example showing this wrap-in-parentheses pattern. (For reference, it renders 'Wizards First Rule 1994 (1994)' when {year} also appears as a bare token, or 'Title (1994)' on its own — confirmed by execution.)
  - _evidence:_ Page lines 49-58: the Combined section that follows only covers '{seriesPosition:00? - }', never the {year? (}{year?)} parenthesis-wrap. Executed renderTemplate('{title} {year? (}{year?)}', {title:'Wizards First Rule', year:'1994'}) => 'Wizards First Rule 1994 (1994)'.
  - _fix:_ Either add the promised concrete example (e.g. template '{title} {year? (}{year?)}' with a book that has a year => 'Wizards First Rule (1994)', and without => 'Wizards First Rule'), or replace the dangling 'See combined example below' text with the actual output value in the same row.

### `guides/import-lists.mdx` — minor-drift

_The page is largely accurate against current code. All three list types (Audiobookshelf, NYT, Hardcover), their fields, the shared settings (Enabled, Sync Interval default 1440), the dedup model (ASIN or title+author, silently skipped), and all three tips (sync errors stored/visible, "Added via" provenance on the book page, deletion doesn't remove books) verify correctly. Two accuracy issues: the NYT "List" field is documented as free-text with a default, but the UI is a fixed two-option dropdown; and the metadata-enrichment description ("ASIN lookup") under-describes the actual two-path logic (ASIN-identity vs. fuzzy search-candidate validation). A couple of minor omissions round out the findings._

- **[WRONG/medium]** ## List Types > NYT Bestsellers table, 'List' row (line 31) — The NYT 'List' field is documented as a free-text field ('Which bestseller list to track. Default: audio-fiction.'), implying the operator can type any NYT list slug. In the actual UI it is a fixed dropdown with exactly two options, and is labeled 'Bestseller List', not 'List'.
  - _evidence:_ src/client/pages/settings/ImportListProviderSettings.tsx:121-130 renders a <SelectWithChevron> labeled 'Bestseller List' offering only <option value="audio-fiction">Audio Fiction</option> and <option value="audio-nonfiction">Audio Nonfiction</option>. The free-text-with-arbitrary-slug framing in the doc does not match this constrained two-choice control.
  - _fix:_ Rename the row to 'Bestseller List' and describe it as a dropdown with two choices: Audio Fiction (audio-fiction, default) and Audio Nonfiction (audio-nonfiction). Drop the implication that any arbitrary list slug can be entered.

- **[STALE/medium]** ## How Sync Works, step 2 (line 56) — Step 2 describes enrichment as 'enriched with metadata (ASIN lookup) if not already known', which only covers the ASIN-identity path. The current code runs a second path: when the item has NO ASIN, it does a metadata search and validates the top candidate with a fuzzy title (Dice >= 0.7) + author-overlap gate; failed validation drops the match and the raw provider fields are used instead.
  - _evidence:_ src/server/services/import-list.service.ts:226-247 (resolveMatch): if item.asin -> enrichBook(asin) (Audnexus identity, no validation); else metadata.search(query) + matchPassesValidation(). matchPassesValidation at lines 418-424 enforces TITLE_MATCH_THRESHOLD = 0.7 and author overlap. The doc's 'ASIN lookup' phrasing misses the non-ASIN search-and-validate path entirely.
  - _fix:_ Reword step 2 to note that items with an ASIN are looked up directly (identity match), while items without an ASIN are matched via a metadata search whose top candidate must pass a title-similarity + author check before its metadata is adopted; otherwise the raw provider fields are kept.

- **[STALE/low]** ## How Sync Works, step 5 (line 59) — Step 5 states newly added books 'are picked up by the next search cycle.' Current code can trigger an immediate search at add time when the 'search immediately' quality setting is enabled, rather than always waiting for the next cycle.
  - _evidence:_ src/server/services/import-list.service.ts:310-316: after creating the book, if this.searchDeps && qualitySettings?.searchImmediately it calls triggerImmediateSearch(bookForSearch, ...). So the 'next search cycle' statement is only true when searchImmediately is off.
  - _fix:_ Add a clause noting that if 'Search Immediately' (quality settings) is enabled, an import-list-added book triggers a search right away; otherwise it is picked up on the next scheduled search cycle.

- **[MISSING/low]** ## Common Settings, 'Sync Interval' row (line 51) — The Sync Interval description gives the default (1440) but omits the enforced minimum of 5 minutes. A value below 5 is rejected by validation.
  - _evidence:_ src/shared/schemas/import-list.ts:78 and :86 both use z.number().int().min(5, 'Sync interval must be at least 5 minutes') on syncIntervalMinutes for create and update.
  - _fix:_ Note the minimum: 'How often to sync, in minutes (minimum 5). Default: 1440 (daily).'

- **[MISSING/low]** ## List Types > Audiobookshelf table, 'Library ID' row (lines 21) — The doc describes 'Library ID' as a value the operator supplies, but omits the in-UI 'Fetch Libraries' helper that lists ABS libraries by name and turns the field into a dropdown, so the operator usually picks a library rather than entering a raw ID. The field is also labeled 'Library' in the UI, not 'Library ID'.
  - _evidence:_ src/client/pages/settings/ImportListProviderSettings.tsx:67-101: label 'Library', a 'Fetch Libraries' button (handleFetchLibraries -> api.fetchAbsLibraries) populates a <SelectWithChevron> of library names; the raw text input ('Library ID (or fetch libraries)') is only the fallback when no libraries have been fetched. Backed by route src/server/routes/import-lists.ts:36-72 (POST /api/import-lists/abs/libraries).
  - _fix:_ Mention that after entering Server URL + API Key you can click 'Fetch Libraries' to pick the library from a dropdown by name, with manual ID entry as a fallback; and align the field label to 'Library'.

### `guides/manual-import.mdx` — significant-drift

_five findings_

- **[WRONG/high]** Line 8 access claim and the manual-import URL — Route is import not manual-import, and it is opened from the Library page overflow toolbar menu, not reachable from any Activity dropdown.
  - _evidence:_ App.tsx line 30 registers path import. Links are on the Library page overflow menu (OverflowMenu.tsx line 127, LibraryHeader.tsx line 10, EmptyLibraryState.tsx line 42).
  - _fix:_ Reword to access it from the Library page toolbar overflow menu and choose Import, or go directly to import.

- **[WRONG/high]** Lines 43-49 import-mode table marks Move as the default — Default import mode is Copy, not Move. The doc has the default backwards.
  - _evidence:_ useManualImport.ts line 30 initializes the mode state to copy, and useManualImport.test.ts line 452 asserts the default is copy.
  - _fix:_ Move the default annotation from the Move row to the Copy row.

- **[WRONG/medium]** Line 16 click the folder icon — There is no clickable folder icon. The icon in the path field is decorative (pointer-events-none); the control that opens the directory browser is a button labeled Browse.
  - _evidence:_ PathInput.tsx lines 57-63 render FolderIcon in a pointer-events-none aria-hidden span; lines 75-82 render the Browse button.
  - _fix:_ Reword to click the Browse button to open the directory browser.

- **[MISSING/high]** Step 1 (Select a Directory) and Tips — Omits that scanning a folder inside the library path is blocked and the user is redirected to a separate Library Import flow the doc never mentions. Also omits the Favorite Folders and Recent Folders lists, and the Line 57 default-to-library-path tip is now misleading.
  - _evidence:_ PathStep.tsx lines 71-81 warn and link to library-import; Scan disabled at line 90; useManualImport.ts line 128; LibraryPathError at library-scan.service.ts line 276. Favorite/Recent Folders at PathStep.tsx lines 98-186; fallback browse path at line 59.
  - _fix:_ Note Manual Import is for folders outside the library path (in-library folders redirect to Library Import), mention the Favorite/Recent Folders lists, and reframe the Line 57 tip.

- **[STALE/medium]** Lines 28-33 status table (Duplicate, skipped) and Line 55 tip (auto-skipped) — Duplicate handling is shown as one status that is simply skipped. The UI has two badges (Already in library for DB dupes, Duplicate in scan for within-scan dupes) and duplicates start unchecked but can be force-imported, not hard-skipped.
  - _evidence:_ ImportCard.tsx lines 140-146 render both badges; useManualImport.ts lines 82-83 leave duplicate rows selectable; handleImport at lines 165-166 sends forceImport for selected duplicates.
  - _fix:_ Use the actual badge labels and note duplicates can be force-imported rather than permanently skipped.

### `guides/quality-gates.mdx` — significant-drift

_The Quality Gates page is structurally out of sync with the current Settings UI and filtering pipeline. The biggest problems: it presents one "Settings > Quality" table that mixes settings now split across four separate UI sections (Quality, Filtering, Search, "When a New Book Is Added"); it documents a "Monitor for Upgrades" setting that does not exist anywhere in the code; it omits the Min/Max Download Size filters that are actually in the Quality section; several defaults are wrong (Min Seeders is 1 not 0; Reject Words ships with a default word list, not empty); the filtering pipeline list omits real gates (ebook-only-format, min-size, max-size) and gets blacklist matching wrong (hash AND guid); and the post-download review section describes two buttons (Approve/Reject) and a reject behavior that no longer match the three-button UI (Approve / Reject / Reject & Search) where plain Reject does NOT blacklist. The Quality Tiers table is accurate and matches the code exactly._

- **[WRONG/high]** Search-Time Filters table + "Configure in Settings > Quality" (lines 10-20) — The page presents a single "Settings > Quality" table, but these settings are NOT all in one Quality section anymore. In the current UI they are split across four distinct settings sections, so a user following this doc will not find most of them under Quality.
  - _evidence:_ QualitySettingsSection.tsx only renders grabFloor (labeled "MB/hr Grab Minimum"), minSeeders, minDownloadSize, maxDownloadSize. Protocol Preference lives in SearchSettingsSection.tsx:132-142 ("Search" section). Reject Words + Required Words live in FilteringSettingsSection.tsx:103-129 ("Filtering" section). Search Immediately lives in NewBookDefaultsSection.tsx ("When a New Book Is Added" section).
  - _fix:_ Restructure the section to reflect the four UI groupings: Quality (Grab Floor/MB-hr minimum, Min Seeders, Min/Max Download Size), Filtering (Languages, Min Duration, Reject Words, Required Words), Search (Protocol Preference, Search Priority), and When a New Book Is Added (Search Immediately). Stop telling users everything is under Settings > Quality.

- **[WRONG/high]** Search-Time Filters table — "Monitor for Upgrades" row (line 20) — The "Monitor for Upgrades" setting does not exist. There is no monitorForUpgrades field in the schema, registry, or any settings form, and no UI toggle for it.
  - _evidence:_ grep for monitorForUpgrades returns only unrelated test files; the quality settings schema (quality.ts:9-18) has no such field, and NewBookDefaultsSection.tsx ("When a New Book Is Added") renders only a single Search Immediately toggle.
  - _fix:_ Delete the "Monitor for Upgrades" row entirely.

- **[WRONG/medium]** Search-Time Filters table — Min Seeders default (line 16) — Doc says Min Seeders default is 0. The actual default is 1.
  - _evidence:_ quality.ts:12 `minSeeders: z.number().int().nonnegative().default(1)` and registry.ts:78 `minSeeders: 1`.
  - _fix:_ Change the Min Seeders default from 0 to 1.

- **[WRONG/medium]** Search-Time Filters table — Reject Words (lines 17-18) — Doc implies Reject Words is empty by default (example only). It actually ships with a populated default reject list, and the example given (`abridged, sample, demo`) does not match the real default.
  - _evidence:_ quality.ts:7 `DEFAULT_REJECT_WORDS = 'Virtual Voice, Free Excerpt, Sample, Behind the Scenes, Abridged'`; registry.ts:81 sets rejectWords to that default. FilteringSettingsSection.tsx:110 uses it as the placeholder.
  - _fix:_ Note that Reject Words defaults to `Virtual Voice, Free Excerpt, Sample, Behind the Scenes, Abridged` (out of the box) and use that as the example. Required Words is empty by default.

- **[MISSING/medium]** Search-Time Filters table (lines 12-20) — Two real search-time filters are entirely missing: Min Download Size (MB) and Max Download Size (GB). These are first-class fields in the Quality settings section and active gates in the pipeline.
  - _evidence:_ quality.ts:13-14 `minDownloadSize` (default 0) and `maxDownloadSize` (default 5 GB); QualitySettingsSection.tsx:78-114 renders both; search-pipeline.ts:148-165 implements the below-min-size and over-max-size gates.
  - _fix:_ Add rows for Min Download Size (MB, default 0 = disabled, filters tracker-test uploads/single-track previews) and Max Download Size (GB, default 5, 0 = disabled). Note Max defaults to 5 GB, not unlimited.

- **[WRONG/medium]** How Filtering Works — pipeline steps (lines 24-34) — The described 7-step pipeline is incomplete and partly mis-ordered versus the real gate chain. It omits the ebook-only-format gate and the min-size/max-size gates, and states blacklisting is "by info hash" when it is by info hash AND guid.
  - _evidence:_ search-pipeline.ts buildQualityGates runs gates in order: reject-word -> required-word -> ebook-only-format (line 116) -> below-min-seeders -> below-grab-floor -> below-min-size (line 149) -> over-max-size (line 158), then language partitioning (line 207), then ranking. filterBlacklistedResults matches on both infoHash and guid (lines 240-254).
  - _fix:_ Update the pipeline list to include the ebook-only-format filter (drops EPUB/AZW3/PDF/MOBI-only results) and the min-size/max-size filters, fix the gate ordering, mention the language filter step, and correct "by info hash" to "by info hash or GUID."

- **[STALE/medium]** Search-Time Filters table — Reject/Required Words descriptions (lines 17-18) — Doc says these match against "release title" only. The current implementation matches across multiple surfaces (nzbName, raw title, title, author, narrator) using word-boundary matching, not naive substring on the title.
  - _evidence:_ search-pipeline.ts:99-113 builds `surfaces = [r.nzbName, r.rawTitle, r.title, r.author, r.narrator]` and uses `matchesWord()` (word-boundary). The Filtering UI help text confirms: "matching any word in title, subtitle, author, narrator, or format type" (FilteringSettingsSection.tsx:113).
  - _fix:_ Reword to: words are matched (with word-boundary matching) against the release title/name, author, and narrator fields, not just the title string.

- **[WRONG/high]** Reviewing Held Downloads (lines 69-76) — The held-download review UI now has THREE buttons (Approve, Reject, Reject & Search), not two. Crucially, the plain Reject button is dismiss-only and does NOT blacklist the release — blacklisting + re-search is the separate "Reject & Search" button. The doc's "Reject — deletes files and blacklists the release" is wrong for plain Reject.
  - _evidence:_ DownloadActivityCard.tsx renders Approve / Reject / Reject & Search (lines 39, 49, 59). Route default retry=false (activity.ts:160 `rejectBodySchema ... default(false)`); QualityGateOrchestrator.reject passes retry through and only blacklistAndRetrySearch runs when retry=true (quality-gate-orchestrator.ts:179-186, 320-337). File deletion is additionally gated on the import setting deleteAfterImport (default false), so files are not deleted by default (gatedRejectionCleanup, quality-gate-orchestrator.ts:350-367; registry.ts:44 deleteAfterImport:false).
  - _fix:_ Document all three buttons: Approve (import), Reject (dismiss only — no blacklist, no re-search), Reject & Search (blacklist + re-search). Note that file deletion only happens when 'Delete after import' is enabled in Import settings (off by default).

- **[MISSING/medium]** Hold Reasons table (lines 60-67) — Two hold reasons that the gate actually emits are missing: imported_book_replacement (held when re-grabbing a book that is already imported, to force explicit review) and unhandled_error (gate threw an unexpected error). Both surface in the UI as hold-reason pills.
  - _evidence:_ quality-gate.service.ts:110-114 pushes 'imported_book_replacement' and holds; quality-gate-orchestrator.ts:94/143 push 'unhandled_error' with probeFailure on catch; QualityComparisonPanel.tsx:57/73 render unhandled_error and the holdReasons pills.
  - _fix:_ Add imported_book_replacement ("This book is already imported; the new grab is held so you can confirm the replacement") and unhandled_error ("An unexpected error occurred during evaluation") to the Hold Reasons table.

- **[MISSING/low]** Post-Download Quality Gate decision table (lines 54-58) — The auto-import row only describes the upgrade case (better MB/hour than existing). It omits the first-download case, where the book has no files on disk yet and the download is auto-imported with no quality comparison at all.
  - _evidence:_ quality-gate.service.ts:123-128 — when book.path === null (search placeholder, no existing files), the gate auto-imports without comparing quality.
  - _fix:_ Add to the Auto-import row that a first download for a book (no existing files) is auto-imported without a quality comparison, provided no hold reasons fired.

### `guides/recycling-bin.mdx` — obsolete

_This entire page documents a "Recycling Bin" soft-delete/restore feature that does not exist in the current codebase. Deleting a book is a hard delete: BookService.delete() removes the DB row outright and deleteBookFiles() does rm(path, {recursive, force}) — files are permanently removed, never moved to a config/recycle/<bookId>/ directory. There is no metadata snapshot stored for restore, no restore/purge/empty-all operations, no "System > Recycling Bin" UI page, and no "Recycle Retention Days" setting (General settings has only housekeepingRetentionDays and seriesCacheRetentionDays). The only vestige is an event-history "deleted" snapshot written to the audit log on deletion — an audit trail, not a recoverable bin. Recommend deleting this page entirely (or rewriting it to document the actual hard-delete + optional "delete files from disk" confirmation flow). Grep for "recycl" across the whole repo returns zero source hits._

- **[WRONG/high]** Entire page; intro (line 6) and 'How It Works' steps 1-4 (lines 10-13) — The page claims deleting a book performs a soft-delete into a recycling bin with full restore capability. The code performs an irreversible hard delete. There is no recycling bin feature anywhere in the codebase.
  - _evidence:_ src/server/services/book.service.ts:409-416 BookService.delete() runs `this.db.delete(books).where(eq(books.id, id))` (hard DB delete). Lines 422-436 deleteBookFiles() runs `rm(bookPath, { recursive: true, force: true })` then cleanEmptyParents() — files are permanently deleted, not moved. The delete route src/server/routes/books.ts:78-133 deletes files from disk when deleteFiles==='true', cancels downloads, deletes the DB row, and cleans the cover cache — there is no move to config/recycle/<bookId>/. A repo-wide grep for 'recycl' (case-insensitive) returns zero matches in src/.
  - _fix:_ Delete this page. If a deletion guide is wanted, rewrite it to describe the actual flow: DELETE /api/books/:id with an optional 'Also delete files from disk' checkbox (DeleteBookModal.tsx); deletion is permanent; active downloads for the book are cancelled.

- **[WRONG/high]** How It Works step 2 (line 11): 'the recycling bin stores a full snapshot: title, author, narrator, description, cover URL, ASIN, ISBN, series info, duration, genres, and monitoring status' — No recycling-bin snapshot table or record exists. The only snapshot taken on delete is an event-history 'deleted' audit-log entry, which is not a restorable store.
  - _evidence:_ src/server/routes/books.ts:111-119 records a 'deleted' event via deps.eventHistory.create({ bookId, ...snapshotBookForEvent(book), eventType: 'deleted', source: 'manual' }) — comment explicitly says 'snapshot preserved via event fields'. This is the event_history audit trail, not a recycle store; there is no code path that reads it back to re-create a book.
  - _fix:_ Remove the snapshot claim. If documenting the audit trail, describe it accurately as a non-restorable 'deleted' entry in Activity / Event History.

- **[WRONG/high]** Retention section (lines 16-21): 'Configure in Settings > General > Recycle Retention Days. Range: 0-365 days. Default: 30. Set to 0 to disable automatic cleanup.' — There is no 'Recycle Retention Days' setting. The General settings schema has no recycle-related field; the named setting, its 0-365 range, default 30, and the 0-disables behavior are all fabricated relative to current code.
  - _evidence:_ src/shared/schemas/settings/general.ts:7-12 generalSettingsSchema contains only logLevel (default 'info'), housekeepingRetentionDays (z.number().int().min(1).max(365).default(90)), seriesCacheRetentionDays (...default(30)), and welcomeSeen. No 'recycleRetentionDays'. Note min(1), so 0 is not even an allowed value for the retention fields that do exist.
  - _fix:_ Remove the Retention section. Neither the setting name, range, default, nor the 0-disables semantics exist.

- **[WRONG/high]** Managing the Recycling Bin (lines 23-31): 'Access from System > Recycling Bin' with Restore / Purge / Empty All actions table — There is no Recycling Bin page under System and no Restore, Purge, or Empty All operations in the API or UI.
  - _evidence:_ Grep for 'Recycling'/'Recycle'/'restoreBook'/'emptyAll'/'/recycle' across src returns only two unrelated e2e-test-helper files (generic 'purge' cleanup, confirmed no recycle/restore/emptyAll symbols). The books route file exposes only delete endpoints (DELETE /api/books/:id, DELETE /api/books/missing) — no restore/purge/empty-all routes. No client page implements a recycling bin.
  - _fix:_ Remove the section. No such page or actions exist in the app.

- **[WRONG/medium]** Restore Behavior bullets (lines 33-37): conflict-on-occupied-path, status 'wanted' on missing-files restore, author re-match restore — All three restore behaviors describe a restore operation that does not exist (no restore endpoint, service method, or UI). These are documentation of phantom functionality.
  - _evidence:_ No restore code path exists (see grep above). BookService has create/update/delete/fixMatch/etc. but no restore method; routes/books.ts has no restore route. The described 'wanted'/conflict/author-match restore semantics have no implementation to verify against.
  - _fix:_ Remove these bullets along with the rest of the page.

### `guides/remote-path-mappings.mdx` — minor-drift

_The page is fundamentally accurate against current code: remote path mappings exist as a per-download-client feature under Settings > Download Clients, use Remote Path / Local Path fields, perform prefix-replacement on paths reported by the client, and the debug-log troubleshooting tip is correct (import.service.ts:129 logs both originalPath and resolvedPath). The recent metadata/MAM/discovery changes don't touch this feature. Two real discrepancies: (1) the troubleshooting section claims trailing-slash inconsistency can change results, but the code explicitly normalizes trailing slashes — that advice is wrong and misleading; (2) the page omits that when multiple mappings match a path, the longest (most specific) prefix wins. A minor omission: mappings can now also be added while creating a client, not only while editing._

- **[WRONG/medium]** Troubleshooting, step 3 (line 80) — The doc tells users to ensure trailing slashes are consistent because '/downloads/' and '/downloads' can produce different results. The matcher normalizes trailing slashes on both the remote-path config and the reported path before comparing, so trailing-slash differences do NOT change the outcome. This advice sends users chasing a non-existent cause.
  - _evidence:_ src/core/utils/path-mapping.ts:12-14 normalize() does p.replace(/\\/g,'/').replace(/\/$/,'') + '/', stripping any trailing slash and re-adding exactly one before matching (applied to remotePath at line 31 and localPath at line 43). src/core/utils/path-mapping.test.ts:46-52 'normalizes trailing slashes before matching' proves a remotePath of '/downloads/complete' (no trailing slash) still matches '/downloads/complete/BookTitle'.
  - _fix:_ Remove or rewrite step 3. Replace with an accurate note such as: 'Trailing slashes do not matter — Narratorr normalizes them, so /downloads and /downloads/ behave identically.' Keep separator guidance only if you still want to note that backslash vs forward-slash are both accepted (they are normalized too).

- **[MISSING/low]** Configuration section (line 44) and Multiple Download Clients example (lines 71-73) — The page says Narratorr 'checks if the path starts with any configured remote path' but never states that when MULTIPLE mappings on the same client match a path, the longest (most specific) remote prefix wins. Users layering an overlapping pair (e.g. /downloads/ and /downloads/complete/) on one client can't predict the result from the docs.
  - _evidence:_ src/core/utils/path-mapping.ts:27-38 iterates all mappings and keeps the one with the greatest normalizedRemote.length (bestLength). src/core/utils/path-mapping.test.ts:37-44 'selects longest matching remote prefix when multiple mappings match' asserts /downloads/complete/ wins over /downloads/ for /downloads/complete/BookTitle.
  - _fix:_ Add a sentence to the Configuration section: 'If more than one mapping matches, Narratorr uses the longest (most specific) remote path.' This also makes the 'Multiple Download Clients' framing more complete for the single-client overlapping case.

- **[MISSING/low]** Configuration section (line 37) — The doc states mappings are configured by editing an existing client. You can now also add mappings while CREATING a client, before it is saved (a separate inline editor). Minor, but the 'Edit a client' phrasing is incomplete.
  - _evidence:_ src/client/components/settings/DownloadClientForm.tsx:98-99 renders RemotePathMappingsSubsection only in edit mode, but renders PathMappingEditor (inline, staged via pathMappings state) in create mode; the create payload carries pathMappings (src/shared/schemas/download-client.ts:115).
  - _fix:_ Adjust the Configuration sentence to note mappings can be added either when creating a new download client or when editing an existing one, both under Settings > Download Clients.

### `guides/rss-feeds.mdx` — significant-drift

_The page is mostly accurate on the mechanics (30-min default, 5–1440 range, 0.7/70% fuzzy match, Torznab/Newznab RSS-capability, quality-gate reuse, blacklist filtering). But two claims are wrong: (1) RSS is configured under Settings > Search ("RSS Sync" subsection), NOT a top-level "Settings > RSS" page that doesn't exist; and (2) the page repeatedly describes RSS matching/grabbing "books with monitor for upgrades enabled" with a "strictly better quality (higher MB/hour)" rule — that upgrade path does not exist in the RSS pipeline, which only targets books with status exactly 'wanted'._

- **[WRONG/high]** Enabling RSS section, line 10 ("Configure in **Settings > RSS**.") — There is no top-level "Settings > RSS" page. RSS settings live as an "RSS Sync" subsection inside Settings > Search.
  - _evidence:_ src/client/pages/settings/SearchSettingsSection.tsx:144-173 renders the "RSS Sync" subsection (h4 "RSS Sync", "Enable RSS Sync" toggle, "RSS Interval (minutes)") inside the Search settings form. src/client/pages/settings/registry.ts has no RSS entry (Grep for RSS/rss returns no matches), confirming RSS is not a standalone settings page. The RSS schema is also nested under the search-adjacent flow, not its own nav route.
  - _fix:_ Change to "Configure in **Settings > Search**, in the **RSS Sync** subsection." Also update the settings table labels to match the actual UI copy: the toggle is labeled "Enable RSS Sync" (not "Enabled") and the interval field is "RSS Interval (minutes)" (not "Interval").

- **[WRONG/high]** How It Works, step 2 (line 20: "...matched against your **wanted** books and books with **monitor for upgrades** enabled") and step 5 (line 24: "For upgrade candidates, the new release must be strictly better quality (higher MB/hour)") — The RSS pipeline has no "monitor for upgrades" candidate set and no per-candidate "strictly better quality" gate. It only targets books whose status is exactly 'wanted'. The described upgrade behavior does not exist for RSS.
  - _evidence:_ src/server/jobs/rss.ts:51 builds candidates solely from `bookListService.getAll('wanted')` — there is no second fetch of upgrade-monitored books. The 'wanted' status is not in TAB_STATUS_MAP (src/server/services/book-list.service.ts:42-45), so buildListWhere resolves it to `eq(books.status, 'wanted')` (book-list.service.ts:85-91) — exact-status only, no upgrade union. The RSS job applies the standard quality gate (filterAndRankResults, rss.ts:158-168) but performs no compareQuality/"strictly better than existing copy" check; there is no monitorForUpgrades field driving RSS candidate selection anywhere in src/server. (Auto-upgrade exists only for the import/download-orchestrator replacement flow, not RSS.)
  - _fix:_ Remove the "and books with monitor for upgrades enabled" clause from step 2 and delete step 5 entirely. RSS matches only against books in the 'wanted' state and grabs the best-ranked result that passes the quality gate — there is no upgrade-comparison logic in the RSS path.

### `guides/tagging.mdx` — minor-drift

_The page's technical substance — tag modes, field mappings, cover-art formats, supported file extensions, ffmpeg requirement, and pipeline ordering — all match the current code. The drift is concentrated in two areas: (1) the settings UI location is wrong (tagging lives under "Post Processing", not a standalone "Tagging" page, and there is no "Processing" page either), and (2) the re-tag section is now stale — re-tagging is a full preview modal (per-file diff, per-field include/exclude, per-run mode/embedCover overrides), not a one-click apply of current settings. No invented findings; everything else verified accurate._

- **[WRONG/high]** Section 'Enabling Tagging', line 10: "Configure in **Settings > Tagging**." — There is no "Settings > Tagging" page. Tagging settings (enable toggle, mode, embed cover) live under the "Post Processing" settings page alongside the ffmpeg path and processing options.
  - _evidence:_ src/client/pages/settings/registry.ts:35-46 — settingsPageRegistry has no 'tagging' entry; the only relevant page is { path: 'post-processing', label: 'Post Processing', ... }. The tagging form controls (Tag Embedding toggle, Tag Mode, Embed Cover Art) are rendered by src/client/pages/settings/ProcessingSettingsSection.tsx:279-318, which PostProcessingSettings.tsx renders. The app itself references "Settings → Post Processing" (RetagPreviewModal.tsx:133).
  - _fix:_ Change to "Configure in **Settings > Post Processing**" (the tagging controls are at the bottom of that page).

- **[WRONG/high]** Section 'Enabling Tagging', line 18: "configure its path in **Settings > Processing > ffmpeg Path**" — The settings nav label is "Post Processing", not "Processing". There is no page labeled "Processing".
  - _evidence:_ src/client/pages/settings/registry.ts:37 — label is 'Post Processing'. The ffmpeg Path field is on that page (src/client/pages/settings/ProcessingSettingsSection.tsx:179). The codebase's own error copy reads "Set the ffmpeg path in Settings > Post Processing" (tagging.service.ts:467).
  - _fix:_ Change to "**Settings > Post Processing > ffmpeg Path**".

- **[STALE/medium]** Section 'Enabling Tagging' table, lines 12-16: rows **Enabled**, **Mode**, **Embed Cover** — The setting labels shown in the table don't match the actual UI labels, so a user scanning the Post Processing page won't find controls named "Enabled" / "Mode" / "Embed Cover".
  - _evidence:_ src/client/pages/settings/ProcessingSettingsSection.tsx — the master toggle is labeled "Tag Embedding" (line 282), the dropdown is "Tag Mode" (line 294), and the cover toggle is "Embed Cover Art" (line 309).
  - _fix:_ Rename the table rows to **Tag Embedding** (master toggle), **Tag Mode**, and **Embed Cover Art** to match the on-screen labels. Optionally note that tagging is disabled by default (taggingSettingsSchema enabled defaults to false).

- **[MISSING/medium]** Section 'Re-tagging', lines 52-54 — The re-tag flow is materially richer than "uses the current tagging settings." Re-tagging opens a preview modal that shows a per-file before→after diff, lets the user include/exclude individual tag fields via checkboxes, and lets the user override mode and embed-cover for that single re-tag run (without changing saved settings). None of this is documented.
  - _evidence:_ src/client/components/RetagPreviewModal.tsx — CanonicalCard renders per-field include/exclude checkboxes (lines 234-267), ContextBanner exposes mode + embedCover overrides (onModeChange/onEmbedCoverChange, lines 222), and per-file diffs are shown (FileRow/DiffRow, lines 301-344). Server side: TaggingService.planRetag builds the preview (tagging.service.ts:349) and retagBook accepts excludeFields + { mode, embedCover } overrides (tagging.service.ts:316-320). The preview is served by GET /api/books/:id/retag/preview.
  - _fix:_ Expand the Re-tagging section to describe the preview-and-confirm modal: it previews exactly which files change and how, lets you opt specific fields out (e.g. keep the existing title), and lets you temporarily override mode / embed-cover for that run. Note it defaults to the saved Post Processing tagging settings.

### `troubleshooting.mdx` — minor-drift

_The troubleshooting page is broadly accurate on connectivity/test failures, download-client ports, and the AUTH_BYPASS recovery flow. But it has one actively-harmful instruction (FlareSolverr `/v1` suffix, which the app appends itself — following the doc produces a broken `/v1/v1` endpoint), one inverted behavioral claim (minimum seed time gates torrent *removal* after import, not import itself, and only when delete-after-import is on), and several stale UI navigation paths. The settings UI was reorganized: there is no top-level "Processing", "Library", "Import", or log-level-in-General tab. Tabs are General, Post Processing, Indexers, Download Clients, Search, Notifications, Blacklist, Security, Import Lists, System. ffmpeg lives under "Post Processing"; log level lives under "System"; Library/Import are sub-sections inside the "General" tab._

- **[WRONG/high]** FlareSolverr not working > URL format (line 72) — Doc instructs users to set the FlareSolverr URL to include the /v1 path (e.g. http://flaresolverr:8191/v1). The app appends /v1 itself, so following this advice produces a double /v1/v1 endpoint that FlareSolverr rejects — the exact failure mode this section is meant to fix.
  - _evidence:_ src/core/indexers/fetch.ts:112 builds the endpoint as `${normalizeBaseUrl(proxyUrl)}/v1`. normalizeBaseUrl (src/shared/normalize-base-url.ts:6) only strips trailing slashes (`url.replace(/\/+$/, '')`) — it does NOT strip a trailing /v1, so a user-entered .../v1 becomes .../v1/v1. The UI field placeholder is the correct bare base form: `http://flaresolverr:8191` (src/client/components/settings/indexer-fields/flaresolverr-field.tsx:17).
  - _fix:_ Change the URL-format guidance to the bare base URL WITHOUT /v1: 'should be http://flaresolverr:8191 (no /v1 — Narratorr appends the API path itself)'. Match the in-app placeholder.

- **[WRONG/high]** Downloads aren't importing > Minimum seed time (line 53) — Doc states 'for torrents, Narratorr waits until the configured minimum seed time before importing.' This is inverted. Import happens immediately when the download completes; minimum seed time/ratio only defer REMOVAL of the torrent after a successful import, and only when 'Delete After Import' is enabled. Listing this under 'Downloads aren't importing' is misleading — seed time never blocks import.
  - _evidence:_ src/server/services/import.service.ts:169 logs 'Import completed successfully' BEFORE any seed gating; removal runs only `if (importSettings.deleteAfterImport)` at :171→handleTorrentRemoval (:226), where isTorrentRemovalDeferred defers *cleanup/removal* (:244-247). The UI field is disabled unless deleteAfterImport is on and its help text reads 'How long to seed before removing the torrent (only applies when delete after import is enabled)' (src/client/pages/settings/ImportSettingsSection.tsx:51,60-62).
  - _fix:_ Rewrite to: 'Minimum seed time only applies when Delete After Import is enabled, and it gates when the torrent is REMOVED from your client after a successful import — it does not delay the import itself. If imports aren't happening, seed time is not the cause.' Move/remove from the import-failure list or reframe accordingly.

- **[STALE/medium]** Audio processing fails > ffmpeg not found (line 83) — References 'Settings > Processing' for the ffmpeg path. There is no 'Processing' tab; the tab is named 'Post Processing'.
  - _evidence:_ Settings nav registry has no 'Processing' entry — the tab is `{ path: 'post-processing', label: 'Post Processing', component: PostProcessingSettings }` (src/client/pages/settings/registry.ts:37). ffmpegPath renders inside ProcessingSettingsSection under that tab (PostProcessingSettings.tsx:1-5).
  - _fix:_ Change 'Settings > Processing' to 'Settings > Post Processing' here and anywhere else the page refers to processing settings.

- **[WRONG/medium]** Downloads aren't importing > Check logs (line 55) and Audio processing fails (line 87 'Check logs') — Doc tells users to set the log level to debug in 'Settings > General'. The log-level control is not in the General tab — it lives in the System tab under the 'Logging' section.
  - _evidence:_ The Log Level select is rendered by GeneralSettingsForm (src/client/pages/settings/GeneralSettingsForm.tsx:82-89), which is mounted ONLY in SystemSettings (src/client/pages/settings/SystemSettings.tsx:21,188), the component for the 'System' tab (registry.ts:45). The 'General' tab (GeneralSettings.tsx) contains Library/Defaults/Naming/Import/Network/Discovery/Appearance/Onboarding — no log level.
  - _fix:_ Change 'Settings > General' to 'Settings > System' (Logging section) for setting the log level.

- **[STALE/low]** Downloads aren't importing — Library path (line 50) and Minimum seed time (line 53) — References '(Settings > Library)' and '(Settings > Import)' as if these are navigation destinations. There are no top-level Library or Import tabs; both are sub-sections within the 'General' tab. A user scanning the tab list won't find them.
  - _evidence:_ Settings tabs are General, Post Processing, Indexers, Download Clients, Search, Notifications, Blacklist, Security, Import Lists, System (src/client/pages/settings/registry.ts:35-46). LibrarySettingsSection (title 'Library') and ImportSettingsSection (title 'Import') are both rendered inside the General tab (src/client/pages/settings/GeneralSettings.tsx:35,38).
  - _fix:_ Update path references to 'Settings > General > Library' and 'Settings > General > Import' so users know to open the General tab and scroll to the section.