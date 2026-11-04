# Three network prototypes

These editable figures and the gallery live outside `public/` and are not shipped in `dist/`. Generated standalone benches are intentionally omitted. To recreate them, use `build.mjs` from the official [hairline-create skill](https://github.com/lucasmarkes/hairline/tree/main/skills/hairline-create):

```sh
# Set this to the installed skill directory containing build.mjs, kernel.js and bench.html.
HAIRLINE_SKILL=/path/to/hairline/skills/hairline-create
node "$HAIRLINE_SKILL/build.mjs" design/network/island.js design/network/island.html
node "$HAIRLINE_SKILL/build.mjs" design/network/layers.js design/network/layers.html
node "$HAIRLINE_SKILL/build.mjs" design/network/rack.js design/network/rack.html
node "$HAIRLINE_SKILL/build.mjs" public/hairline/network.js design/network/network-preview.html
npm run dev
```

Open `/design/network/index.html` through the Vite dev server. Each generated `.html` figure is a standalone Hairline bench built without modifying the kernel or bench. `network-preview.html` previews the current runtime figure. Generated benches remain outside the production build.

1. **layers** — vertical hierarchy; a picked device rises and its route lights.
2. **island** — selected for home, revised to four devices without a cloud. Hover gently lifts only the picked device; links follow its ports. The slider sets lift (3–10 world units, default 6). The small lift is intentional: the creator requested subtle motion.
3. **rack** — a workstation beside an open rack; the chosen rack module slides forward. The slider sets drawer travel. Travel is deliberately limited to the shelf depth, rather than moving the whole rack; the thumbnail displacement check is therefore smaller than in the layered prototype.

All keep fixed hit areas, a single packet, the kernel frame loop and reduced motion. Layers and rack retain their original cloud. The selected island uses router → switch → computer/server; its tour visits computer, router, server, then rest. Geometry and source are inspired by the official Router, Hub, Relay, Patch and Exploded figures: https://hairline.lucasmarkes.com/figures

The gallery uses the same public Hairline palette variables as Quizly for its dark previews. It does not change the standalone bench files.

The revised island is integrated into home as public/hairline/network.js. The other two figures remain review artifacts.
