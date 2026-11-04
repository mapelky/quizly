# Quizly

A study app with quizzes imported from JSON files. Includes 75 Polish CCNA questions covering modules 1–3.

- A 40-question random quiz with a score and answer review.
- Single-question practice with feedback and an explanation.
- Module list and question previews at `/moduly`.

Built with React, Vite and HeroUI. No backend or user accounts. Session answers are not saved.

## Getting started

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173` or the address shown by Vite.

## Tests and build

```sh
npm test                        # data validation, sampling and scoring
npx playwright install chromium # once before running browser tests
npm run test:e2e                 # Chromium tests
npm run build                   # production files in dist/
npm run preview                 # preview the build locally
```

## Data and deployment

Questions live in [public/questions.json](public/questions.json). See the [format example](public/example-bank.json) and [source notes and limitations](docs/moduly-1-3-import.md) (in Polish).

Deploy the `dist/` directory. Configure `/moduly` to fall back to `index.html`.
Search indexing is intentionally disabled: the HTML includes `noindex, nofollow`, and Vite adds an `X-Robots-Tag` header.
[public/_headers](public/_headers) provides the rule for Netlify and Cloudflare Pages. On other hosts, configure `X-Robots-Tag: noindex, nofollow` and verify the header after deployment.

Component and asset licenses: [React Bits](src/components/react-bits/LICENSE.md), [Hairline](public/hairline/LICENSE), [fonts](public/fonts/README.md).

An independent educational project, not affiliated with Cisco.
