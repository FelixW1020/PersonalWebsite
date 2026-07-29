# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Felix Wang's personal portfolio website (felixwang.cv, aliased via `CNAME`). It is a static, single-page site with no build system, package manager, or framework — just `index.html`, `style.css`, and `main.js`, plus image/video/PDF assets served directly from the repo root.

## Development

There is no build, lint, or test tooling — this is plain HTML/CSS/JS served as static files.

- **Preview locally**: open `index.html` directly in a browser, or serve the directory (e.g. `python3 -m http.server`) since the hero video/iframes behave more reliably over `http://` than `file://`.
- **Deploy**: the site is static; pushing to `main` is the deploy (confirm with the user before pushing, per repo-wide git safety norms — there is no CI/build step to catch mistakes before they go live).

## Architecture

The entire site is a single HTML page (`index.html`) with CSS-only "tabs" and JS-driven visibility toggling — there is no router and no page reloads.

- **Section/tab model**: Every top-level view (Portfolio, About, Résumé, and each individual project detail page) is a `<section class="tab-section" id="...">` inside `<main class="content">`. Only the section with the additional `.active` class is visible (`display: none` otherwise, via `style.css`). `main.js` toggles `.active` on the target section and the corresponding `.nav-link` in response to clicks.
- **Navigation is data-attribute driven**: links use `data-target="<section-id>"` (see `.nav-link` and `.project-link` elements). Click handlers in `main.js` read `data-target`, deactivate all sections/nav-links, then activate the matching ones. There are three separate listener groups doing this pattern: top nav (`.nav-link`), project card / in-page links (`.project-link`), and the home logo (`#home-logo`) — when adding a new nav target, ensure it's reachable from all the entry points that should link to it.
- **`body` class mirrors the active section**: `body.className` is set to `${targetId}-active` on every navigation. CSS relies on this for section-specific styling — notably `body:not(.portfolio-active)` hides the hero video/overlay on every non-portfolio page, and `body[class*="project-"]` hides the global footer on project detail pages. When adding a new section, check whether it needs similar `body`-class-scoped CSS rules.
- **Project cards vs. project detail sections**: The Portfolio grid (`.masonry-grid`) contains one `.grid-item.project-card` per project, each linking via `data-target` to a full detail `<section id="project-*">` further down the same file. To add a new project, add both: (1) a grid item card in the `#portfolio` section, and (2) a matching `<section id="project-*">` detail block later in `index.html`, following the existing structure (back-to-projects link, header image, `.about-container` wrapper, styled sub-sections).
- **Styling is largely inline**: most project detail sections use inline `style=` attributes rather than CSS classes for one-off layout (image sizing, spacing). Shared/reusable styling (nav, grid, resume list, footer, hero) lives in `style.css` using CSS custom properties defined in `:root` (`--bg-color`, `--text-color`, `--nav-color`, `--nav-hover`).
- **Hero video**: `.hero-video` autoplays/loops muted on the Portfolio tab only; `main.js` includes an iOS-specific workaround (calling `.play()` on load and again on first `touchstart`) since iOS Safari blocks programmatic autoplay without a user gesture.
- **External embeds**: some project sections embed third-party content directly (YouTube iframe for the cannula device demo, Google Drive PDF preview iframe for the exoplanet research paper, external GitHub Pages links for MycoSpec/cannula firmware repos) rather than hosting that content in this repo.
