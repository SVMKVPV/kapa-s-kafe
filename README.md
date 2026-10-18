# Kapa's Kafe ☕

**A cinematic coffee journey from the Papua New Guinea Highlands to your cup.**

This is a **standalone Kapa's Kafe project** in `SVMKVPV/kapa-s-kafe`. It is not connected to BLVCK OAK. The current experience is a design prototype: it does **not** accept payments or orders, and it does not claim that any supplier relationships have already been established.

## Five scroll chapters

1. **Where every cup begins** — a rotating 3D coffee bean in amber light.
2. **Suspended in warmth** — beans drift and ground coffee becomes particles.
3. **The foundation** — simulated coffee grounds collect in a glass vessel.
4. **Two streams, exacting** — procedural espresso extraction and rising steam.
5. **From PNG to you** — a finished cup with stylised latte art.

Additional sections: an origin story, a conceptual coffee journey map with editable destination, an animated packaging preview, and a first-access signup form.

## Local preview

The initial prototype is a static site. No build step is needed. Serve from HTTP (not `file://`) because the 3D JavaScript is an ES module:

```sh
python3 -m http.server 8080
# Visit http://localhost:8080
```

Three.js 0.168.0 is loaded from jsDelivr. GSAP 3.12.5 and ScrollTrigger also load via jsDelivr. Google Fonts serves DM Sans and Fraunces. These are external network dependencies; a later production build can bundle JS and fonts for greater resilience. The readable HTML and static bean illustration are available even when the 3D import is blocked.

The main responsive stylesheet includes `prefers-reduced-motion` support. Three.js rendering is disabled when reduced motion is enabled.

## Netlify — when ready

A `netlify.toml` file is included as future deployment configuration. **No Netlify project, domain or deploy has been created.** Later, create a separate Netlify project connected to this repository, select the `main` branch, set the publish directory to `.`, and leave build command blank.

A Netlify Forms signup is included in the static markup but **cannot be confirmed functional until an actual Netlify deployment has been made and tested.** Privacy disclosure and consent should be reviewed before public lead collection.

## Before launching sales

- Confirm PNG producers/exporters and the actual direct-trade arrangement.
- Obtain permission for producer imagery and verify all origin, ethical-trade and roast-process claims.
- Complete food import, labelling, customs and Australian food-safety compliance.
- Finalise product sizes, pricing, stock, shipping, legal/policy pages, refund handling and taxes.
- Build/test real checkout and payments before presenting any bag as available to order.
- Replace sample art and CGI-style bag packaging with approved product imagery and assets.

## Files

| File | Purpose |
|---|---|
| `index.html` | Accessible website structure, five chapters, map, packaging preview, form |
| `styles.css` | Earthy palette, editorial layout, CSS coffee bag and landscape |
| `main.js` | Procedural 3D objects, scroll reactions, city input and menu interactions |
| `favicon.svg` | Coffee bean brand mark |
| `thank-you.html` | Confirmation screen for first-access signup |
| `netlify.toml` | Independent future Netlify static hosting settings |
| `.gitignore` | Excludes local/Netlify temporary files |

## Four-step workflow

1. Story & Art Direction
2. 3D Asset Creation of Beans & Cup
3. Frontend Development with Scroll Animations
4. Performance Optimization
