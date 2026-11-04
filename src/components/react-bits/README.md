# React Bits components

Source: [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits), revision `4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4`.

- [Specular Button](https://reactbits.dev/c/components/specular-button), JavaScript + CSS.
- [Dither](https://reactbits.dev/c/backgrounds/dither?colorNum=16&scale=0.6&waveFrequency=3.1), JavaScript + CSS.

The upstream license is preserved in `LICENSE.md` and copied verbatim to `public/licenses/react-bits-LICENSE.txt` for distribution. No additional runtime dependencies are needed by these versions.

Local changes: respond to live reduced-motion changes; make Specular stationary under reduced motion; expose the native button ref for keyboard focus; skip Dither pointer redraws when interaction is disabled; delete GPU resources and release WebGL contexts on unmount. Context release is deferred and cancelled when StrictMode replays the effect on the same canvas. Context loss stops rendering; Specular uses a CSS glass rim when WebGL is unavailable or lost.

All app views pass `colorNum=16`, `scale=0.6`, `waveFrequency=3.1` and cap Dither at device pixel ratio 1. Dither mouse interaction and click ripples are disabled. Only home animates the background; modules, practice and results use `disableAnimation=true` and `intro=false`. Specular is shared by action buttons; module and question navigation stay lightweight HeroUI controls.
