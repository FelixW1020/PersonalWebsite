# Website Revision Spec — Minimal One-Page Version

**Status:** implemented, not yet committed
**Date:** 2026-07-29

## Goal

Replace what visitors to **felixwang.cv** see with a single, minimal, discreet page.

The driving constraint is **deliberate discretion**: the page should let people know who Felix
is and where he has worked, but *not* what he did there beyond a job title. No methodology,
no results, no metrics, no collaborator names, no partner institutions, no linked source
material. Someone who lands on the site learns the titles and nothing further.

The current detailed site is **not deleted**. It is preserved in full as `classic.html`,
reachable by direct URL but hidden from search engines, and can be made live again with a
single command.

## Design direction

Minimalism modelled on [dpautov.com](https://dpautov.com/) — single left-aligned column set
in the upper-middle of the viewport, plain text lists, no nav bar, no cards, no borders, no
images, no shadows, generous whitespace, hierarchy from size and opacity alone.

Departure from that reference: instead of a flat `#161616` background, the page sits on a
full-bleed **night sky** photograph, animated subtly in-browser.

Plus a custom cursor modelled on [harigridharan.com](https://www.harigridharan.com/) so the
viewer can visually track their mouse.

| Token | Value |
|---|---|
| Background | `nightsky-bg.jpg` (full-bleed, `cover`, fixed) + dark scrim ~25–35% |
| Body text | `#f4f4f5` |
| Muted text (tagline, section labels) | ~`#a1a1aa` / 60% opacity |
| Font | Newsreader (Google Fonts), 400/500/600, 17px body |
| Column | max-width ~560px, left-aligned, offset from top ~15vh |

The source image is already dark enough that white text reads without a heavy overlay — the
scrim exists only to guarantee legibility across the brighter star clusters. Tune it down as
far as legibility allows.

## Page content

Exactly this, in this order. Nothing else.

```
Felix Wang
Engineer. Hardware and embedded systems.

EXPERIENCE
  Avatar Robotics — Field Deployment Engineer, Internship
  Duke Motorsports — Electrical Team

PROJECTS
  MycoSpec
    A vent-mounted sensor that flags airborne mold risk before growth becomes visible.
  Nasal Cannula Detection Device
    A low-cost monitor that alerts caregivers when an infant's oxygen cannula slips out of place.
  Exoplanet Habitable Zone Research
    Transit photometry analysis identifying planets that orbit within their star's habitable zone.

EDUCATION
  Duke University — B.S.E. Electrical & Computer Engineering, B.S. Physics

CONTACT
  felix.wang@duke.edu
```

Rules:

- **Experience and Education are titles only** — no dates, no descriptions, no links.
- **Projects carry one blurb each**, added 2026-07-29. Each says what the thing *is* and stops
  there: no metrics, no institutions, no partners, no collaborator names. This is the one
  relaxation of the titles-only rule; keep new blurbs to a single line at that altitude.
- **No graduation year** on the Duke entry (also stripped from the old site).
- **No high school.** Stevenson does not appear.
- **Email only** for contact, added 2026-07-29. No phone (the old footer's number is not carried
  over), no GitHub, no LinkedIn.
- **No link to `classic.html`** or to the résumé PDF anywhere on the page.

The email is also the page's only link, which is what activates the cursor's `is-hot` swell —
verified going from 9px hollow to 34px filled on hover.

### Deliberately dropped from the old site

These remain in `classic.html` and are simply absent from the new page: the About section and
headshot, Northwestern (CIERA), Stellarverse, Patriot Aquatics Club, Duke Engineers for
International Development, Gabrielse Group, the Skills & Interests line, all four project
detail pages, all project poster images, the hero video, the résumé PDF link, and the
email/phone footer.

## Background animation

The source `nighysky.png` is 5456×3632 and **15 MB** — it must not ship as-is.

1. Produce an optimized derivative, ~2560px wide, target 300–600 KB:
   ```sh
   sips -Z 2560 -s format jpeg -s formatOptions 80 nighysky.png --out nightsky-bg.jpg
   ```
   (`sips` is available on this machine; `ffmpeg` and `cwebp` are not. Add a `.webp` variant via
   `<picture>` later if desired.)
2. Keep `nighysky.png` in the repo untouched as the source of truth. Note the filename is
   missing its `t` — leave it, name the derivative correctly.

Motion, all in-browser, no video file:

- **Slow drift / zoom / rotation** — 45s linear alternating cycle, `scale(1.12)→(1.22)` with a
  1.4° rotation. The rotation is what makes it read as the real sky turning about the celestial
  pole. Measured at ~2px/s of travel — perceptible without being distracting.
- **Twinkle layer** — a `<canvas>` overlay, 160 points, sinusoidal alpha between 0.10 and 0.75.
- **Meteors** — a pool of concurrent streaks with gradient tails at shallow angles, spawning every
  0.3–0.9s with a 75–125 frame lifetime, capped at 8 at once. This is the element a still
  photograph cannot produce, and it's what makes the sky read as live.

  > Concurrency is roughly *lifetime ÷ spawn-interval*. A first pass used a 1.2–3.5s interval
  > against a ~1.3s lifetime, giving well under one meteor on screen at a time — visibly wrong
  > despite the code being correct. Tune both numbers together, not just the interval.
- **Mouse parallax** — the sky offsets up to 14px opposite the cursor, lerped, so the page
  responds to the same input the cursor effect tracks.

All respect `prefers-reduced-motion: reduce` — when set, the background is static.

> A first pass used a 90s cycle with a tiny delta and was effectively invisible. If tuning this
> again, the drift needs to stay above roughly 1px/s to register at all.

### Why not an actual video file

A video *rendered from the still* can only pan and zoom — identical to what the CSS already does,
but several megabytes and no longer able to react to the pointer. Genuinely new motion (wheeling
stars, moving cloud) would require licensed timelapse footage or AI generation, neither of which
is Felix's own photograph. The canvas meteors deliver the "it's alive" read for ~1 KB instead.

## Cursor effect

Measured directly from harigridharan.com. Two parts:

1. **Native cursor** replaced by a tiny dot that tracks the pointer exactly, via CSS:
   ```css
   body {
     cursor: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23f4f4f5'/%3E%3C/svg%3E") 10 10, auto;
   }
   ```
2. **Trailing ring** — a `div` moved by a `requestAnimationFrame` lerp toward the pointer
   (factor ≈ 0.15–0.2 per frame, converging in ~400–500ms), which swells into a filled circle
   over any link:
   ```css
   .cursor-ring {
     position: fixed; top: 0; left: 0; z-index: 9999;
     width: 9px; height: 9px; border-radius: 50%;
     border: 1px solid #f4f4f5;
     pointer-events: none;
     mix-blend-mode: difference;
     transform: translate(-50%, -50%);
     will-change: transform;
     transition: width .4s cubic-bezier(.16,1,.3,1),
                 height .4s cubic-bezier(.16,1,.3,1),
                 background .4s cubic-bezier(.16,1,.3,1),
                 border-color .4s cubic-bezier(.16,1,.3,1);
   }
   .cursor-ring.is-hot {
     width: 34px; height: 34px;
     background: #f4f4f5;
     border-color: transparent;
   }
   ```

`mix-blend-mode: difference` is what makes the ring invert whatever it passes over — keep it.

Disable entirely (hide the ring, restore `cursor: auto`) on touch/coarse pointers and under
`prefers-reduced-motion: reduce`.

## File layout & the swap

| File | Role |
|---|---|
| `minimal.html` | source of truth for the new version — **edit this** |
| `classic.html` | frozen copy of today's `index.html` — **never edit** |
| `index.html` | a copy of whichever version is live |
| `minimal.css`, `minimal.js` | new page's styles and behavior |
| `style.css`, `main.js` | old page's assets, untouched |

Swapping which version is live:

```sh
cp classic.html index.html   # revert to the full detailed site
cp minimal.html index.html   # return to the minimal site
```

Or just ask Claude to "switch to the old version."

**Rule: never hand-edit `index.html`.** It is a build artifact. Edits go to `minimal.html` or
`classic.html`, then get copied over.

Both versions stay permanently reachable by URL regardless of which is live. All old asset
paths keep working because every file stays in the repo root.

## Hiding the old version from search

`classic.html` must be reachable by direct URL but not discoverable.

1. `robots.txt` — add `Disallow: /classic.html`
2. `classic.html` `<head>` — add `<meta name="robots" content="noindex">`
   *(This is the only edit made to the old version — an addition, not a removal.)*
3. `sitemap.xml` — keep listing only `/`; bump `lastmod`.
4. No link to `classic.html` from the new page.

### The résumé PDF

**Decision: kept in the repo.** Briefly removed with `git rm`, then restored at Felix's request
on 2026-07-29. The file is present and unstaged; no commit ever recorded its deletion.

Consequences of keeping it:

- The new minimal page does **not** link to it, so it is not reachable by browsing the live site.
- `classic.html` still links to it, so a rollback gives a working résumé link with no extra steps.
- It remains directly downloadable at
  `felixwang.cv/FelixWang_Resume_Mar2026(F).pdf` by anyone with the URL.
- `robots.txt` now carries a `Disallow` for it, which discourages indexing but does **not**
  restrict access. A PDF cannot carry a `noindex` meta tag, and GitHub Pages cannot set an
  `X-Robots-Tag` header, so this is the only available lever.

> **Unresolved:** the PDF still contains the GPA, SAT score, and graduation years that were
> deliberately stripped from the page, which cuts against the discretion goal. Re-exporting it
> without those fields would let the résumé link stay without reintroducing the detail. Not done.

## Task checklist

- [x] Tag the pre-revision state — `git tag v1-full-site`
- [x] `cp index.html classic.html` — freeze the current site
- [x] Add `<meta name="robots" content="noindex, nofollow">` to `classic.html`
- [x] Generate `nightsky-bg.jpg` from `nighysky.png` via `sips` — 2560px, q65, **389 KB**
- [x] Build `minimal.html` — content exactly as specified above
- [x] Build `minimal.css` — Inter, dark palette, single column, full-bleed background, scrim
- [x] Build `minimal.js` — cursor dot + trailing ring, sky drift, twinkle canvas, mouse parallax
- [x] Guard all motion behind `prefers-reduced-motion` and coarse-pointer checks
- [x] ~~`git rm` the résumé PDF~~ — reverted; PDF kept in the repo (see above)
- [x] Update `robots.txt` and `sitemap.xml` `lastmod`
- [x] `cp minimal.html index.html` — make it live
- [x] Verify in a headless browser: desktop, 390px mobile, reduced-motion, and `classic.html`
- [ ] **Commit and push** — not done; awaiting review

### Verification results

Checked at 1440×900 and 390×844, plus a `prefers-reduced-motion` context:

- Ring tracks with a real trail — mid-move it sat at `617,498` while the pointer headed to
  `200,700`, confirming the lerp rather than rigid following.
- `mix-blend-mode: difference` active; sky drift animation running; parallax transform applied.
- Drift measured over 12s: scale `1.1235 → 1.1502`, translate `-1.5px → -13.5px`, rotation
  climbing steadily. Frames 6s apart are provably non-identical.
- Meteors confirmed by isolating the canvas layer (photo and text hidden): 2–3 streaks visible in
  a single frame, matching the intended concurrency. No exposed background edges from the rotation.
- Whole page fits without scrolling at 1440×900 and 1920×1080; at 1512×860 it overflows by 32px of
  bottom padding only, with the email still above the fold at 832px. Spacing is tuned for this —
  loosen `.page` padding or `.block` margins only if content is removed.
- Email link verified: `mailto:felix.wang@duke.edu`, and hovering it swells the cursor ring from
  9px hollow to 34px filled.
- No horizontal overflow at either width. Zero console errors, zero failed requests.
- Mobile: ring `display: none`, cursor `auto`. Reduced-motion: ring, twinkle, and drift all off.
- `classic.html` intact — `noindex, nofollow` present, all 4 project cards, hero video present.

## Out of scope

- Any deletion of old content — every section, image, and page is preserved in `classic.html`.
- Re-exporting the résumé PDF (flagged above, needs a decision).
- Higgsfield or any AI-generated media. The connector is disconnected; the background is
  Felix's own photograph animated with CSS/JS.
- Restyling the old version. `classic.html` is frozen apart from the one `noindex` tag.

## Rollback

To bring the old version back as the live site:

```sh
cp classic.html index.html
```

That's the whole operation — the résumé PDF is still in the repo, so `classic.html`'s download
link works immediately. Then remove the `Disallow` lines from `robots.txt` if you want the old
version and its PDF indexed again.

Deeper layers, if needed:

- `git tag v1-full-site` — the full site exactly as it stood before this revision.
- `git tag pre-immersive-hero` — the repo state before any of this session's work began.
- Full git history on `main`.
