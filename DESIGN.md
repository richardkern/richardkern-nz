---
name: richardkern.nz
description: A personal blog and portfolio built as a bound notebook — paper leaves, a charcoal cover, and a mono logbook layer.
colors:
  bush-charcoal: "#171b16"
  paper: "#f7f5ef"
  ink: "#22261f"
  fern: "#2a5a43"
  moss: "#8fb8a5"
  haze: "#5e6459"
  structural-lifted: "#20261e"
  code-base: "#e9e7e0"
  code-string: "#d9c79e"
  code-comment: "#98a19b"
typography:
  display:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "clamp(3.375rem, 2.1875rem + 5vw, 6.75rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Geist Sans, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.16em"
  logbook:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.9
rounded:
  sharp: "0"
  md: "6px"
  full: "9999px"
components:
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  nav-link-active:
    textColor: "{colors.fern}"
    typography: "{typography.label}"
  theme-toggle:
    textColor: "{colors.haze}"
    rounded: "{rounded.full}"
    size: "30px"
  code-block:
    backgroundColor: "{colors.bush-charcoal}"
    textColor: "{colors.code-base}"
    rounded: "{rounded.md}"
    padding: "24px 28px"
  logbook-entry:
    textColor: "{colors.haze}"
    typography: "{typography.logbook}"
---

# Design System: richardkern.nz

## 1. Overview

**Creative North Star: "Cover & Pages, with a logbook"**

The site is a bound notebook. A single warm paper surface carries all the reading; charcoal appears only where the object is structural or technical — the vertical spine down the homepage, the footer, and code blocks — like the cover and binding of a physical book. That charcoal-against-paper contrast is the signature move and the only structural device; nothing else competes with it. Over the top runs a **logbook layer**: everything *about* an entry (its number, dates, tech, filenames) is set small in Geist Mono, while everything *in* an entry is serif. Entry N° is real — a post's chronological position among published posts, not decoration.

The register is brand: this is a place where the design *is* the product, so legibility and typographic rhythm are the substance, not ornament. The mood is quiet and editorial — the calm of a well-made magazine, not the flatness of a tool. It reads as understated, precise, and warm: nothing shouts, and the care shows in the details. It explicitly rejects the four things this site must never become: the generic dev-portfolio template (neon-gradient hero, skill bars, "Hi I'm X, Full-Stack Developer"), the SaaS/startup marketing site (tracked-uppercase eyebrows on every section, hero-metric grids, CTA-stuffed pages), the loud personal-brand influencer (big face, hustle energy, popups), and the sterile corporate blog (faceless, over-templated, no point of view).

Dark mode is a real inverted theme, not an afterthought. In dark the whole page becomes the cover material (charcoal), so the structural panels lift a hair to `#20261e` to stay distinct against it. The system follows the OS by default and persists an explicit override; an inline head script applies the choice before paint.

**Key Characteristics:**
- One paper reading surface throughout; charcoal reserved for structural/technical zones only.
- A mono logbook layer (N°, dates, filenames) over a serif reading layer.
- Flat by default: sharp corners, hairline rules, no shadows.
- Theme-aware semantic tokens that flip light↔dark in place; the accent flips fern→moss because fern fails AA on charcoal.
- Restraint as identity: a single considered motion moment (the homepage reveal), and nothing else moves.

## 2. Colors

A warm-neutral paper anchored by a near-black bush charcoal, with a single desaturated green accent that shifts by surface.

### Primary
- **Fern** (`#2a5a43`): the accent on paper — links, active nav, focus rings, the `.` after the name and the `.nz` in the wordmark. Deep enough to hold AA on the paper surface. This is the one color that carries meaning; everything else is structure.
- **Moss** (`#8fb8a5`): the accent on charcoal surfaces (spine, footer, code keywords). Fern fails AA against charcoal, so moss is its dark-surface counterpart — same idea, lifted for legibility. In dark mode moss also becomes the page-wide accent.

### Neutral
- **Bush Charcoal** (`#171b16`): the cover material. Structural panels in light mode (spine, footer, code) and the whole page background in dark mode. A green-black, never a true neutral black.
- **Paper** (`#f7f5ef`): the reading surface and the page background in light mode; text on charcoal panels in both modes. A committed warm off-white — the brand's own material, paired with charcoal, not a default warm tint.
- **Ink** (`#22261f`): primary body text on paper. A warm near-black that reads softer than pure charcoal.
- **Haze** (`#5e6459`): secondary and meta text on paper — the logbook layer, captions, muted labels. Holds ~AA at body sizes; used for supporting text, never primary prose.
- **Structural Lifted** (`#20261e`): dark-mode-only. The hair-lifted charcoal the structural panels sit on so they read as distinct once the whole page is charcoal.

### Tertiary (code surfaces)
- **Code Base** (`#e9e7e0`): default code text on the charcoal code block.
- **Code String** (`#d9c79e`): a warm sand for strings, numbers, and values — no acid syntax colors.
- **Code Comment** (`#98a19b`): grey-green for comments; keywords reuse moss.

### Named Rules
**The Structural-Charcoal Rule.** Charcoal is earned, not decorative. It appears only where the site is structural or technical — the homepage spine, the footer, and code blocks. Never add a fourth charcoal device to a page; the rarity is what makes the contrast read as binding rather than as a color scheme.

**The Two-Accent Rule.** Fern on paper, moss on charcoal — never the reverse. Every accent decision is settled by which surface it sits on. On paper surfaces style with the semantic tokens (`text-accent`, which resolves to fern in light and moss in dark); on the always-dark structural panels use `text-moss` literally.

## 3. Typography

**Display Font:** Schibsted Grotesk (with sans-serif fallback)
**Body Font:** Source Serif 4 (with Georgia, serif fallback)
**UI/Label Font:** Geist Sans
**Mono/Logbook Font:** Geist Mono

**Character:** A grotesk display paired with a warm reading serif — contrast on the serif/sans axis, never two similar sans faces. The mono is not for code alone: it *is* the logbook voice, so a page carries three roles at once — serif to be read, grotesk to title, mono to annotate.

### Hierarchy
- **Display** (Schibsted Grotesk 700, `clamp(3.375rem, 2.1875rem + 5vw, 6.75rem)`, line-height 0.98, letter-spacing −0.03em): the homepage name only. The single largest thing on the site.
- **Headline** (Schibsted Grotesk 600, 1.625rem / 26px, line-height 1.25, −0.02em): prose `h2` in posts and pages.
- **Title** (Schibsted Grotesk 600, 1.25rem / 20px, line-height 1.3, −0.02em): prose `h3`; smaller section headings.
- **Body** (Source Serif 4 400, 1.1875rem / 19px, line-height 1.7): long-form reading in posts, projects, pages, and the homepage bio. The measure is left uncapped in prose (`maxWidth: none`) because the reading column is already width-bounded by layout; keep new prose columns near 65–75ch.
- **Label** (Geist Sans 500, ~11px, letter-spacing 0.16em, uppercase): the two homepage section labels ("Writing", "Selected work") and nav links (13px, not uppercased). Used sparingly.
- **Logbook** (Geist Mono 400, ~10.5–11px, line-height 1.9): entry N°, dates (`28.06`), years, filenames, code-block captions. The layer of information *about* an entry.

### Named Rules
**The Logbook Rule.** Everything *about* an entry is Geist Mono; everything *in* an entry is Source Serif 4. Metadata never borrows the serif; prose never borrows the mono. This split is the system — hold it everywhere.

**The One-Display Rule.** The clamp display scale (up to 6.75rem) is reserved for the homepage name. Inner-page headings step down to headline/title. Two competing display moments on one page is prohibited.

## 4. Elevation

Flat by definition. There are no drop shadows anywhere in the system; depth is conveyed entirely by material contrast and hairline rules. The charcoal structural panels read as *behind* or *around* the paper because of tonal difference, not shadow. Dividers do the rest: `border-hairline` (7% ink) for quiet list separators, `border-rule` / `border-rule-strong` (9–12%) for section boundaries, and `border-rule` on media frames. All rules flip to paper-alpha in dark mode and stay in place.

### Named Rules
**The No-Shadow Rule.** Surfaces never lift with a shadow. If something needs to feel distinct, change its material (paper vs charcoal) or divide it with a hairline rule. A shadow on this site would read as a different site.

## 5. Components

The system is link- and text-driven — it has almost no buttons. Affordance comes from color shift and underline, not from filled controls.

### Navigation
- **Style:** text links in Geist Sans, 13px, medium weight. Header nav is `text-body` shifting to `text-accent` on hover.
- **Active state:** `text-accent` (fern/moss) with a 1.5px underline offset 6px, plus `aria-current="page"`. The underline is the only chrome.
- **Tap targets:** negative margin + padding preserve a ≥44px target without moving the text.
- **Header:** sticky, `bg-surface`, bottom `border-rule`, wordmark left / nav + theme toggle right.

### Theme Toggle
- **Shape:** a 30px circle, `rounded-full`, 1px border (`border-rule-strong` on paper, `border-paper-border` on charcoal).
- **Behavior:** cycles light → dark → system; the icon shows the current choice (sun / crescent / split-circle), the aria-label announces state and next step. A `before:-inset-2` pseudo-element extends the tap target past the visible 30px.
- **Hover:** border and icon shift to the surface's accent (fern on paper, moss on charcoal).

### Code Block (signature)
- **Surface:** bush charcoal (`bg-structural`), `rounded-md` (6px) — the one place radius is used at size — with 24×28px padding and `data-surface="charcoal"` so focus rings switch to moss.
- **Syntax:** in-family palette — moss keywords, warm-sand strings/numbers, grey-green comments, `code-base` for identifiers. No acid green, no rainbow.
- **Filename caption:** Geist Mono 10.5px, letter-spacing 0.08em, `text-paper-faint`, above the code.

### Logbook Rail (signature)
- **Structure:** a `[64px_1fr]` (→ `[96px_1fr]` at md) grid per entry — the mono meta column (N° over date) beside the serif title.
- **Meta:** Geist Mono ~10.5px, `text-muted`; `formatEntryNo` renders `N°07`, `formatLogDate` renders `28.06`.
- **Title:** Source Serif 4 ~15–16px, `text-body` shifting to `text-accent` on hover; the whole row is the link.
- **Divider:** `border-b border-hairline` between entries. No cards.

### Tags & Filters
Tags are never filled pills or bordered chips — the flat system expresses them as text.
- **Filter bar** (`/posts`): a `flex-wrap` row of Geist Sans 13px text links with an "All" reset, bottom-ruled (`border-b border-rule`). Inactive links are `text-muted`; the active tag is `text-accent` with a 1.5px underline offset 5px. This is the site's only filter control.
- **Inline tags** (post index rail): Geist Sans 12px, medium, `text-accent`, gap-separated — a plain accent-text list under the excerpt, not a bordered set.
- **Post meta tags** (post page): the same tags rendered as accent links inside the mono meta line (see Post Meta Line), underlined on hover.

### Post Meta Line (signature)
The canonical logbook expression at the head of every post: `N°07 · 28.06.2026 · homelab`.
- **Style:** Geist Mono 12px, letter-spacing 0.04em, `text-muted`, all on one line.
- **Structure:** entry N°, then the long-form date (`28.06.2026`), then tags — separated by a spaced middot (`&nbsp;·&nbsp;`, `aria-hidden`). Tags are `text-accent` links; N° and date are muted mono.
- **Placement:** sits directly above the display `h1`, so the annotation layer introduces the reading layer.

### Wordmark
- **Style:** `richardkern` in Geist Mono 500, lowercase, letter-spacing 0.02em, with `.nz` in the surface accent (fern on paper, moss on charcoal). Sizes: 16px header, 12.5px footer, 13px on the spine (rotated vertical), 13px mobile top bar.

### Section Label
- **Style:** Geist Sans ~11px, medium, uppercase, letter-spacing 0.16em, `text-muted`, with a `border-b border-rule-strong` underline. The deliberate exception to "no eyebrows" — used only as the two homepage rail headings, part of the logbook system, not scattered above every section.

## 6. Do's and Don'ts

### Do:
- **Do** reserve charcoal for structural/technical zones only — spine, footer, code. The **Structural-Charcoal Rule** is the identity.
- **Do** style page surfaces with the semantic theme-aware tokens (`bg-surface`, `text-body`, `text-muted`, `text-accent`, `bg-structural`, `border-hairline`/`rule`) so light↔dark flips in place. Use the raw anchors (`text-paper*`, `text-moss`) only on the always-dark structural panels.
- **Do** keep the logbook split absolute: mono for everything *about* an entry, serif for everything *in* it.
- **Do** stay flat — divide with hairline rules and material contrast, never a shadow.
- **Do** keep motion to the single homepage reveal, with its `prefers-reduced-motion` fallback intact; everything else is still.
- **Do** verify fern holds AA on paper and moss holds AA on charcoal before using an accent on a new surface.

### Don't:
- **Don't** make it look like the **generic dev-portfolio template** — no neon-gradient hero, skill bars, or "Full-Stack Developer" banner.
- **Don't** make it look like a **SaaS/startup marketing site** — no tracked-uppercase eyebrow above every section, no hero-metric grid, no CTA-stuffed landing page. The two homepage section labels are the only uppercase labels; do not spread them.
- **Don't** make it look like a **loud personal-brand influencer** page — no big face, no hustle energy, no newsletter popup.
- **Don't** make it look like a **sterile corporate blog** — keep the point of view and the handmade detail.
- **Don't** add gradient text, `background-clip: text`, glassmorphism, or decorative blur. The palette is solid color and material contrast.
- **Don't** use `border-left`/`border-right` side-stripes on cards or callouts, and don't reach for identical card grids — the logbook rail (hairline-divided rows) is the list pattern here.
- **Don't** put fern text on charcoal or moss text on paper; the **Two-Accent Rule** is settled by surface.
- **Don't** introduce a second display-scale heading on a page, or a fourth charcoal device. Restraint is the brand.
