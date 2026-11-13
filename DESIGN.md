---
name: Westlogic
description: Corporate site of a Czech e-commerce group that builds its own brands, set as a neutral swatch fan deck.
colors:
  card-stock: "#EEF0EC"
  card-stock-deep: "#E2E5DF"
  paper: "#FAFBF9"
  ink: "#141414"
  ink-soft: "#474A46"
  rule: "#C9CDC5"
  on-ink-soft: "#C9CCC6"
  on-ink-muted: "#A6AAA3"
  on-ink-rule: "#3A3C39"
  error-on-ink: "#FF8A75"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.2rem + 4.1vw, 5.25rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 70"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.2rem + 2.8vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 72"
  brand-name:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.4rem + 3.2vw, 4.75rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 64"
  numeral:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 1.6vw, 3rem)"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 62"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.15
    fontVariation: "'wdth' 76"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'tnum', 'lnum'"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.3
    fontVariation: "'wdth' 85"
rounded:
  strip-hinge: "6px"
  card: "10px"
  full: "50%"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  max-width: "1360px"
  section-top: "clamp(72px, 11vw, 144px)"
  head-gap: "clamp(28px, 4vw, 48px)"
  strip-gap: "10px"
components:
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "0 1.4em"
    height: "48px"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0 1.4em"
    height: "48px"
  button-line-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0 1.4em"
    height: "48px"
  blade:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  brand-strip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "18px 32px 18px 20px"
  input-on-ink:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "13px 14px"
---

# Design System: Westlogic

## Overview

**Creative North Star: "The Neutral Swatch Fan Deck"**

The site is a printer's swatch fan deck with no colours of its own. Paper-white blades fan out from a rivet on cool card-stock ground. Each blade carries one real brand logo, downloaded from the brand's own site. The group is the neutral binding; the brands are the only colour. A visitor reads Westlogic as the sum of six real marks, not as a seventh invented palette.

Everything else is ink on card. Condensed Archivo in heavy weights carries the voice: tall, tight, confident headlines over quiet, plain body text. Structure comes from ink rules (1.5px) and soft grey rules (1px), not from boxes. Depth is paper depth: thin, soft shadows under paper objects (blades, strips) and nothing under the page structure. The one dark band is the contact block and footer, ink-filled, where paper becomes the foreground.

The user rejected six invented brand colours and invented material prints for the brands. Colour enters only through the real logos, and the logos stay subdued until a visitor asks for them.

**Key Characteristics:**
- Cool card-stock ground (#EEF0EC), paper objects (#FAFBF9), near-black ink (#141414). No accent colour.
- Real brand logos are the only chromatic element; grey watermark at rest, full colour on hover or open.
- One typeface, Archivo variable, with width (wdth 62–92%) doing the work other systems give to a second face.
- Swatch-deck hardware as the reusable signature: rivet holes, perforation lines, WL codes, the fan.
- Ink rules over boxes; tabular lining numerals everywhere.

## Colors

A cool, near-monochrome paper-and-ink palette; the brand logos supply all colour.

### Neutral
- **Card Stock** (card-stock): page ground. The surface every paper object sits on.
- **Deep Card Stock** (card-stock-deep): punched holes (rivets in blades and strips), scrollbar track. Reads as the stock seen through a hole.
- **Swatch Paper** (paper): blades, brand strips, form fields, text on ink, the paper button. The paper is always lighter than the ground.
- **Printer's Ink** (ink): text, primary buttons, the 1.5px top rules, the contact and footer band, selection and focus rings.
- **Soft Ink** (ink-soft): lead paragraphs, secondary labels, WL codes on strips, roles and dates.
- **Rule Grey** (rule): 1px dividers, perforation lines, list separators, the scrolled header border.

### On Ink (dark band only)
- **Soft Paper** (on-ink-soft): body copy and field labels on ink.
- **Muted Paper** (on-ink-muted): footer text and site headings.
- **Ink Rule** (on-ink-rule): dividers inside the dark band.
- **Error Coral** (error-on-ink): invalid-field ring on ink; lighter #FFB4A6 for the error text. Status only, never decoration.

### Named Rules
**The Brands Bring the Colour Rule.** The system has no accent. The only hue on a page is a real brand logo, used as the brand ships it. Never tint a logo, never invent a brand colour, never add a decorative hue.

**The Watermark Rule.** On brand strips the logo sits at 10% opacity in greyscale. It turns full colour only on hover (90%) or when the strip is open (100%). Colour is a response to interest.

**The Grey Ramp Rule.** Where a sequence needs tonal steps (the four-step process strip), step through neutrals from card toward ink (#C6C9C3, #9A9D97, #555753, #141414). Process steps never get hues.

## Typography

**Display Font:** Archivo variable (with system-ui, sans-serif), self-hosted, wght 100–900, wdth 62–125%.
**Body Font:** Archivo (same file).

**Character:** One family, two voices. Headlines are heavy (800) and condensed (62–72% width), stacked tight like printed swatch codes; body text runs at normal width and weight so it stays plain and readable.

### Hierarchy
- **Display** (800, clamp 2.5–5.25rem, 0.98, wdth 70%): hero headline and the contact headline (wdth 68%).
- **Headline** (800, clamp 2–3.75rem, 1.0, wdth 72%): section heads, set left in a 7/5 grid with a soft-ink note on the right.
- **Brand Name** (800, clamp 2.25–4.75rem, 0.95, wdth 64%): brand names on strips. The largest repeated text after display.
- **Numeral** (800, wdth 62%): market codes (CZ, DE) and process numerals (up to 6rem). Numbers and codes get the tightest width.
- **Title** (700, 1.25–1.375rem, wdth 76–80%): team names, news headlines, step titles, sub-block heads.
- **Body** (400, clamp 1–1.125rem, 1.55): copy; leads cap at 42–56ch.
- **Label** (400–700, 0.8125–0.9375rem, wdth 75–85%): spec terms, WL codes, field labels, dates.

### Named Rules
**The Width Is the Hierarchy Rule.** Rank text by width as well as size: bigger and more important means narrower. Body stays near 100%, labels 85%, titles ~76%, headlines ~70%, numerals 62%. Never set a headline at normal width.

**The Tabular Rule.** Numerals are always tabular and lining (set on body). Figures like 10,5 mil. EUR+ and 12 zemí align like a spec sheet.

## Layout

A centred 1360px column with a fluid gutter (16–56px). Sections open with a large top pad (72–144px) and a two-column head: headline at 7fr, soft-ink note at 5fr, bottom-aligned. Content below is lists separated by rules, not cards: a 1.5px ink rule on top of each list, 1px rule-grey lines between rows.

The hero splits 6/6: copy, a three-cell spec row (ink top rule, rule-grey dividers) and two buttons on the left; the fan deck on the right, sized by container queries so blade geometry scales with its box.

Responsive steps: at 1100px the strip drops its reach column and markets go to 4 columns. At 900px the hero stacks (title, lead, deck, spec, buttons), section heads go single-column, the nav becomes a burger panel, and contact stacks. At 600px strips reflow into a two-line card with the watermark on the right, process steps become rows, and all lists go single-column.

## Elevation & Depth

Hybrid: flat structure, soft paper depth. Page structure (sections, lists, the header) has no shadow; it uses rules. Paper objects that are meant to be handled (blades, brand strips) carry a thin hairline plus a long, soft, negative-spread drop shadow, so they read as paper lying on card. Holes are inset shadows. Shadows grow on interaction, never shrink.

### Shadow Vocabulary
- **Blade** (`0 0 0 1px rgba(20,20,20,.06), 0 1px 1px rgba(0,0,0,.1), 0 12px 26px -14px rgba(20,20,20,.45)`): each fan blade.
- **Strip rest** (`0 1px 1px rgba(0,0,0,.1), 0 14px 28px -22px rgba(20,20,20,.6)`): brand strips.
- **Strip open** (`0 1px 1px rgba(0,0,0,.1), 0 22px 40px -24px rgba(20,20,20,.7)`): an open strip, lifted further.
- **Button lift** (`0 8px 18px -8px rgba(20,20,20,.55)`): ink and paper buttons on hover, with a 2px rise.
- **Punched hole** (`inset 0 1px 2px rgba(0,0,0,.35)`): rivets in blades, deck and strips.

### Named Rules
**The Paper on Card Rule.** Only paper objects cast shadows, and only soft ones with negative spread. Lists, sections and the header stay flat and use rules.

## Shapes

Gently rounded paper (10px) for blades, strips, buttons, fields and the process strip. Brand strips use an asymmetric hinge: 6px on the left (the riveted edge), 10px on the right. Holes are perfect circles. Rules are the main structural shape: 1.5px ink for list tops and the spec row, 1px rule grey for rows, dashed rule grey for the perforation line on each blade.

## Components

### Buttons
Solid and tactile; they rise when touched.
- **Shape:** 10px radius, 48px min height (42px in the header), 1.4em side padding, 600 weight at 92% width.
- **Ink:** ink fill, paper text. Hover rises 2px with the button-lift shadow.
- **Line:** transparent with a 1.5px inset ink ring; hover fills with ink.
- **Paper:** paper fill on the ink band (form submit). Hover rises 2px.
- **Focus:** 2px ink outline, 3px offset (paper outline inside the contact band).

### Fan Deck (signature)
Six paper blades fanned from one rivet at the lower left, 14.5° apart, each blade 20% as wide as it is long. Each blade carries a WL code at the top, the real brand logo rotated -90° along its length, a dashed perforation line, the category label, and a punched rivet hole. Hover or focus lifts the blade 6% of its length; the other blades desaturate (saturate .55, brightness .97). Blades link to their brand strip.

### Brand Strips (signature)
A stack of paper strips, 10px apart, each an accordion button. Row: punched rivet, WL code, condensed brand name, category, market reach, chevron. The real logo sits behind the row as a greyscale watermark (Watermark Rule). Hover slides the strip 6px right; open slides it 14px and deepens the shadow, rotates the chevron 180°, and shows a description with an ink link button to the brand site.

### Lists (markets, team, news, partners)
Ink-ruled lists, no cards. Markets: 6-column grid of condensed numeral codes over soft-ink country names. Team: 3 columns of name (title) and role (soft ink). News: date / headline / arrow link; the arrow moves 4px on hover. Partner logos: greyscale at 78% opacity, full opacity on hover, in cells split by 1px rule-grey insets.

### Inputs / Fields
- **Style:** paper fill, no border, 10px radius, 13px 14px padding; labels in soft paper above, 85% width.
- **Focus:** double ring, 2px ink then 4px paper (`0 0 0 2px #141414, 0 0 0 4px #FAFBF9`).
- **Error:** 2px inset coral ring and coral error text below.

### Navigation
Sticky header on frosted card stock (92% card, blur 10px); a rule-grey bottom border appears once scrolled. Links in 500 weight at 88% width; hover and current page draw a 2px underline from the left. The language switch is soft ink. Below 900px: burger button, nav drops as a full-width card panel with ruled rows and a direct contact link; the header CTA hides.

## Do's and Don'ts

### Do:
- **Do** keep every surface on the card / paper / ink palette; let real brand logos be the only colour.
- **Do** show brand logos as the brand ships them, downloaded from the brand's own site, and keep strip logos greyscale at 10% until hover or open.
- **Do** rank type by width: condensed Archivo 800 (wdth 62–72%) for headlines, names and numerals; normal width for body.
- **Do** build lists with a 1.5px ink top rule and 1px rule-grey row lines instead of cards.
- **Do** reuse the swatch hardware (rivet holes, perforation line, WL codes, fan) when a new surface needs a signature.
- **Do** ease motion with `cubic-bezier(.16, 1, .3, 1)` and honour reduced motion.

### Don't:
- **Don't** add an accent colour or invent brand colours, tints or material prints; the user rejected them.
- **Don't** recolour, outline or tint a brand logo.
- **Don't** put shadows on page structure; only paper objects (blades, strips, buttons on hover) cast them.
- **Don't** use a second typeface; width and weight of Archivo carry the hierarchy.
- **Don't** fabricate numbers, photos or testimonials to fill a layout; only verified figures appear in spec rows.
