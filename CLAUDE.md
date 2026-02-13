# CLAUDE.md - IndieNews Syndicator

## Package Overview

`@rmdes/indiekit-syndicator-indienews` (v1.0.1) - Syndicates posts to [IndieNews](https://news.indieweb.org/) via webmention. Unlike other syndicators that use REST APIs, IndieNews uses the webmention protocol — no API keys or credentials needed.

## Architecture

**Unique approach:** This syndicator sends a webmention to `https://news.indieweb.org/{lang}/webmention` with the post URL as `source` and the IndieNews language page as `target`. IndieNews validates the post, extracts metadata, and adds it to the news feed.

**Multi-language registration:** The `init()` method creates one syndicator instance per configured language. Each instance registers as a separate syndication target in the Micropub UI (e.g., "IndieNews (English)", "IndieNews (Francais)").

## Key Files

| File | Purpose |
|------|---------|
| `index.js` | Plugin class - multi-language registration, syndicate method, target info |
| `lib/indienews.js` | Webmention client - sends POST to IndieNews webmention endpoint |
| `assets/` | Plugin icon (SVG) |

## Data Flow

```
User selects "IndieNews (English)" in syndication UI
  -> syndicate(properties) called with post URL
  -> IndieNews.submit(postUrl)
  -> POST https://news.indieweb.org/en/webmention
     body: source=postUrl&target=https://news.indieweb.org/en
  -> IndieNews validates: post must link to https://news.indieweb.org/en
  -> Returns { result: "success", url: "https://news.indieweb.org/en/..." }
  -> Permalink URL stored as syndication result
```

## Configuration

```javascript
import IndieNewsSyndicator from "@rmdes/indiekit-syndicator-indienews";

new IndieNewsSyndicator({
  languages: ["en", "fr"],  // Creates one target per language
  checked: false,            // Pre-select in syndication UI
})
```

Supported languages: en, fr, de, es, ja, zh (mapped to display names).

## Critical Requirements

1. **Post must link to IndieNews** — The post's HTML must contain a link to `https://news.indieweb.org/{lang}`. IndieNews validates this when receiving the webmention. Without it, submission silently fails.
2. **Post must be publicly accessible** — IndieNews fetches the source URL to validate it.
3. **No credentials needed** — `get environment()` returns `[]`. The webmention protocol is open.

## Inter-Plugin Relationships

- **Used by:** `indiekit-endpoint-syndicate` (triggers syndication)
- **Triggered via:** Micropub `mp-syndicate-to` property
- **Post template requirement:** The Eleventy template must include a `u-syndication` link to IndieNews for the webmention to validate

## Known Gotchas

1. **Template must include IndieNews link** — If the post template doesn't render a link to `https://news.indieweb.org/{lang}`, the webmention will be rejected
2. **Timing** — IndieNews fetches the source URL immediately; if the post isn't live yet, it fails
3. **Error handling** — IndieNews returns `notices` array on failure, not standard error format
4. **No credentials** — Unlike other syndicators, this one needs no API keys or tokens

## Dependencies

Only `@indiekit/error` for consistent error handling. Uses native `fetch()` (Node 20+).

## Commands

```bash
npm install @rmdes/indiekit-syndicator-indienews
```
