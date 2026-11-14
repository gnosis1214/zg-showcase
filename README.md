# Showcase Lab

Interactive, scroll-animated showcase pages for invented products, built once a day. Most are product pages: 3D product scenes, pinned scroll stories, horizontal galleries, live configurators. Some are SaaS, event or editorial landing pages.

**Every page is a single HTML file that works without hosting.** Download it (or clone the repo) and double-click it. It needs an internet connection for the animation libraries and fonts, which load from public CDNs at pinned versions.

Open [`index.html`](index.html) for the gallery, or any file in [`pages/`](pages/).

## Pages

<!-- zg:list:start -->
| Date | Page | Category | Highlights |
|---|---|---|---|
| 2026-11-14 am | [Kavra Strada R](pages/2026-11-14-am-kavra-strada-r.html) | Road bikes and parts | Self-drawing SVG, Pinned explode view, Drag to pedal |
| 2026-11-13 pm | [Corvane Agentic ERP](pages/2026-11-13-pm-corvane-agentic-erp.html) | Enterprise software | Canvas constellation, Pinned workflow story, Exploded layer stack |
| 2026-11-13 am | [Ilura Tidal Bloom](pages/2026-11-13-am-ilura-tidal-bloom.html) | Fragrance | Three.js glass, Drag to rotate, Shader aura |
<!-- zg:list:end -->

## Stack

- Plain HTML, CSS and JavaScript in one file per page. No build step.
- [GSAP](https://gsap.com/) with ScrollTrigger and SplitText for scroll choreography
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling
- [Three.js](https://threejs.org/) for 3D product scenes and shader backgrounds
- Google Fonts

## Repo layout

```
index.html         gallery (cards generated from showcases.json)
pages/             one self-contained HTML file per page
showcases.json     page list: brand, palette, techniques, date
scripts/build.mjs  regenerates the gallery cards and the table above
scripts/check.mjs  checks every page against PLAYBOOK.md
PLAYBOOK.md        design and build rules every page follows
BACKLOG.md         queue of upcoming page concepts
```

## Commands

```bash
npm run build   # update index.html and README.md from showcases.json
npm test        # run the page checks
```

## Notes

All brands, products, prices and specs on these pages are made up. Nothing is for sale, and no page uses a real company's name, logo or product.

Code is MIT licensed. Designed and coded by [Zana-G](https://zana-g.com).
