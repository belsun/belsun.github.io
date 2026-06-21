# Site Analytics

The site includes a lightweight analytics client in `analytics.js`, but it is disabled by default.

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
