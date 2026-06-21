# Wai Ka Sun / Bella Sun Personal Homepage

A static Three.js personal homepage for Wai Ka Sun / Bella Sun, positioned around neural interfaces, embodied AI, robotics, and spatial intelligence.

## Local Preview

1. Install Node.js LTS.
2. Open this folder in Cursor, VS Code, or Terminal.
3. Install dependencies:

```bash
npm install
```

4. Start the dev server:

```bash
npm run dev
```

5. Open the local URL printed by Vite, usually `http://127.0.0.1:5173/`.

The older static preview may still be available at `http://127.0.0.1:4173/` if a separate Python server is running, but Vite is the deployment path.

## Build And Preview Production

```bash
npm run build
npm run preview
```

The production output is written to `dist/`.

## Update Content

- Profile and public identity: `content/profile.json`
- Site metadata, CV path, and CTA labels: `content/site.json`
- Work cards and project pages: `content/projects.json`

After editing JSON, refresh the local dev server.

## Update Latest CV

Replace this file with the current public CV:

```txt
assets/cv/Wai-Ka-Sun-CV-latest.pdf
```

Then update the version and label in `content/site.json`:

```json
"cv": {
  "file": "./assets/cv/Wai-Ka-Sun-CV-latest.pdf",
  "version": "2026-06",
  "label": "Latest CV · updated 2026-06"
}
```

For public deployment, use a CV version without private phone numbers unless you intentionally want them online.

## Analytics

The site includes a disabled-by-default analytics client at `analytics.js`. It can report page views, dwell time, project impressions, and UI interactions after an endpoint is configured in `index.html` and `project.html`.

GitHub Pages does not expose visitor IP logs to this repository. Raw IP analytics require a server-side collector or provider; see `ANALYTICS.md`.

## Deploy To GitHub Pages

1. Create a GitHub repository for this folder, or copy this folder's contents into the repository you want to publish.
2. Push the folder to the `main` branch.
3. In GitHub, open **Settings → Pages**.
4. Set **Build and deployment → Source** to **GitHub Actions**.
5. Push to `main` again or run the workflow manually.
6. GitHub Actions will run `npm ci`, `npm run build`, and publish `dist/`.

The workflow lives at `.github/workflows/deploy.yml`.

## QA Links

Use query parameters to pin a prototype while testing:

```txt
/?prototype=brain
/?prototype=hand
/?prototype=chip
/?prototype=blackhole
```

Project pages use:

```txt
/project.html?id=mindbridge
/project.html?id=unitree-g1-humanoid-control
```

## Notes

- The site uses relative paths (`./`) so it can deploy under a GitHub Pages project subpath.
- `vite.config.js` uses `base: "./"` and builds both `index.html` and `project.html`.
- Keep third-party model/media attributions in `assets/ATTRIBUTION.md`.
