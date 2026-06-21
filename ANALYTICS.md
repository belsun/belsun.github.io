# Site Analytics

The site includes a lightweight analytics client in `analytics.js`, but it is disabled by default.

## Current Status

You cannot see visitor details yet because no analytics endpoint is connected.

The public GitHub Pages site can load the tracking client, but the client exits immediately while `window.SITE_ANALYTICS.enabled` is `false` in `index.html` and `project.html`.

To view real visitors, connect one of the deployment options below, then open that provider's dashboard or database table.

## What It Can Track

When enabled with an endpoint, the client sends:

- `page_view`: page path, title, referrer, viewport, language, prototype query
- `project_impression`: project tile slug/title/prototype when a tile enters view
- `interaction`: clicked links, buttons, and project tiles
- `control_change`: language, palette, and other select/input changes
- `page_dwell`: approximate time on page and scroll depth on page hide

## IP Addresses

GitHub Pages is static hosting and does not expose visitor IP logs to this repo.

The browser cannot reliably know the visitor's public IP. If IP-level analytics are needed, use a server-side endpoint or analytics provider. That endpoint can read the request IP from its own logs or headers.

Before collecting raw IP addresses, add an appropriate privacy notice and decide how long to retain logs.

If you specifically need "how many people, which IPs, how long they stayed, and what they clicked", use a custom endpoint such as Cloudflare Worker + D1/KV/R2. Umami, Plausible, PostHog, or Cloudflare Web Analytics are easier to operate, but most privacy-focused dashboards intentionally avoid showing raw visitor IP addresses.

## Enable

In `index.html` and `project.html`, set:

```html
<script>
  window.SITE_ANALYTICS = {
    enabled: true,
    endpoint: "https://YOUR-ENDPOINT.example/collect"
  };
</script>
```

The endpoint should accept `POST` requests with a JSON body.

After enabling, visit the live site, click a few project links, then check the provider dashboard or backend logs. If `debug: true` is added to the config, events also print in the browser console during local testing.

## Good Deployment Options

- Cloudflare Web Analytics: easiest page-view analytics, privacy-friendly, no raw IP dashboard.
- Umami or Plausible: privacy-focused product analytics with events.
- Cloudflare Worker + KV/D1/R2: custom endpoint if raw IP logs and event export are required.
- Vercel/Netlify function: simple custom collector if the site moves away from pure GitHub Pages.

## Event Payload Shape

```json
{
  "event": "page_view",
  "properties": {},
  "pageId": "uuid",
  "sessionId": "uuid",
  "visitorId": "uuid",
  "path": "/project.html",
  "search": "?slug=mindbridge",
  "hash": "",
  "title": "MindBridge — Wai Ka Sun",
  "referrer": "",
  "language": "en",
  "viewport": { "width": 1440, "height": 900 },
  "timestamp": "2026-06-22T00:00:00.000Z"
}
```
