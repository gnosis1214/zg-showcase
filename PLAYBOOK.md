# Playbook

The rules every page in this repo follows. `npm test` checks the mechanical ones; the rest are on the builder.

## 1. The bar

Each page should feel like a premium product launch site, not a template.

**Look ("aura")**
- Deep base colour (near-black, ink navy, or occasionally a rich light theme) lit by soft, glowing colour fields that shift as you scroll.
- Glass panels: translucent fill, `backdrop-filter: blur()`, 1px hairline borders (`rgba(255,255,255,.08)` range).
- A fine grain overlay (inline SVG `feTurbulence`) to kill banding.
- Big, tight sans headlines (negative letter-spacing) with one serif italic accent word or gradient word per heading. Use it sparingly.
- Generous spacing, a 1240px max content width, a 16px minimum side gutter on phones.
- One palette per page: base, ink, two or three accents. Store the three accents in `showcases.json`.

**Every page must have**
1. **A signature hero:** a Three.js product render, a shader background, or a layered parallax composition. Not a flat image.
2. **One scroll-scrubbed story:** a sticky or pinned section where the product changes with scroll progress (rotation, explode view, colour, fill level, layers, chapters).
3. **One horizontal or layered scroll section:** horizontal track, stacked cards, parallax depth, or a scroll-driven timeline.
4. **One real interactive control:** configurator (size, colour, engraving), hotspots, comparison slider, drag-to-rotate, live calculator or a spec toggle. It must change something visible.
5. **At least three micro-interactions:** magnetic buttons, spotlight cards, cursor glow, hover tilt, count-up numbers, velocity marquee, animated accordion, split-text reveals.
6. **A grabbable product, whenever the hero is a 3D object.** Once the object settles in a section, people can grab it:
   - Mouse or touch drag turns it (and tilts it slightly) with smoothing.
   - Letting go keeps it spinning with inertia, and a quick click flicks it round.
   - A cursor change and a small "Drag to rotate" hint show it can be grabbed until the first grab.
   - Hit-test the object with a raycast so text, links and form controls under or next to it stay clickable.
   - Set `touch-action: pan-y pinch-zoom` on the sections that show it, so vertical swipes still scroll the page.
   - If a section needs a set angle (a label facing the viewer in a configurator), ease back to it after a short pause.
   - The Ilura page has the reference code.

**Product page structure (adapt, don't copy)**
nav with scroll progress, hero, scroll story, marquee or divider, features (bento), specs or ingredients (horizontal), stats, configurator or pricing, FAQ, closing CTA, footer.

**Variety**
Before starting, read the last four entries in `showcases.json`. The new page must differ from each of them in product category, palette, hero technique and signature scroll effect. About three of every four pages are product showcases (`type: product`); the rest are SaaS, event, editorial, studio or app landing pages (`type: other`).

## 2. Opens from disk

Pages must work when someone downloads the file and double-clicks it. No hosting, no server, no domain.

- One file: `pages/YYYY-MM-DD-am|pm-slug.html`. All CSS and JS inline.
- No local images, fonts or scripts. Draw visuals with inline SVG, CSS, canvas or Three.js. A small data URI is fine.
- No `fetch()` of local files, no root-relative URLs (`/x`), and no local `type="module"` files: browsers block all three from `file://`.
- Link back to the gallery with `href="../index.html"`.
- Libraries only from these pinned URLs (all checked to return 200):
  - GSAP 3.13.0 on cdnjs: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js`, plus `ScrollTrigger.min.js`, `SplitText.min.js` from the same folder. Other GSAP plugins (Flip, Observer, MotionPathPlugin, DrawSVGPlugin, MorphSVGPlugin, ScrambleTextPlugin) are free since 3.13. Confirm the URL returns 200 before using one.
  - Lenis 1.3.4: `https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js`
  - Three.js 0.170.0 through an import map: `three` to `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js`, `three/addons/` to `https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/`
  - Google Fonts stylesheets.
- Load GSAP and Lenis as classic `defer` scripts. Put Three.js code in its own inline `type="module"` script so a WebGL or CDN failure can't take down the rest of the page. Show a CSS fallback when 3D doesn't start (`html.no-webgl`).

## 3. Honest and original

- **Fictional brands only.** Invent the brand and product name, then web-search it with the category. If an established company in that space uses it, pick another. No real logos, trademarks, people, press outlets or celebrity names.
- **No fake social proof.** No testimonials or press quotes presented as real. Specs, prices and claims are invented but plausible.
- **Visible notice.** The footer says the brand is fictional and nothing is for sale. Mark it with `data-zg-concept`. Any "buy" button shows a toast saying this is a concept page.
- **Fresh copy for every page.** Specific and sensory. No lorem ipsum, no em dashes, and none of: elevate, unleash, seamless, revolutionize, game-changer, delve, cutting-edge, next-level.
- Never copy code, copy or layouts from a client project or another site.

## 4. Performance and accessibility

- Cap Three.js pixel ratio at 1.75 on desktop and 1.25 on phones. Hide meshes that are off screen. Keep each page under 400 KB.
- `prefers-reduced-motion: reduce`: no smooth scroll, no autonomous motion or parallax, reveals shown at once, horizontal tracks become native scrollers.
- Content stays readable if JavaScript fails. Animate with `gsap.from()` so the default state is visible. An intro overlay must also hide itself through a CSS animation.
- Real headings in order, `button` for actions, labels on inputs, `aria-pressed` / `aria-expanded` / `role="radiogroup"` where they fit, visible `:focus-visible`, body text contrast of at least 4.5:1.
- Works at 360, 768, 1280 and 1920 px wide with no horizontal page scroll.

## 5. Code conventions

- Custom classes start with `zg-`. Shared JS state lives on `window.zg`.
- CSS custom properties for the palette on `:root`.
- Comment the non-obvious parts (shader maths, scroll maps), not every line.
- A `.zg-wrap` placed inside a flex parent shrinks to its content and drifts to the centre on wide screens. Give it `width:100%`.
- Position a fixed 3D product from the layout, not from fixed viewport fractions. Put an empty slot element in the column where it should sit and centre on that, so it stays balanced from 900px to ultra-wide.
- Check short laptop screens (around 1536x700) as well as 1920x1080. The hero should fit above the fold there.

## 6. Done means

1. `npm test` passes.
2. The page was opened from `file://` in a browser at desktop and phone widths, scrolled top to bottom, with no console errors, and the interactive control was tried.
3. `showcases.json` has the entry, `npm run build` was run, and the backlog item is ticked.
