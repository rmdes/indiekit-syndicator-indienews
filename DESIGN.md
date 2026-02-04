# IndieNews Syndicator Design

## Overview

A syndicator plugin for Indiekit that submits posts to [IndieNews](https://news.indieweb.org/), a community-curated aggregator of IndieWeb-related content.

## How IndieNews Works

IndieNews uses webmentions for submission:
1. Post must have a `u-syndication` link pointing to `https://news.indieweb.org/{lang}`
2. Send webmention with `source` (post URL) and `target` (IndieNews homepage)
3. IndieNews returns a permalink URL

No account or API credentials required.

## Plugin Design

### Configuration

```js
// indiekit.config.js
"@indiekit/syndicator-indienews": {
  languages: ["en", "fr"],  // Creates two syndication targets
  checked: false            // Not pre-selected by default
}
```

### Syndication Targets Created

- "IndieNews (English)" → uid: `https://news.indieweb.org/en`
- "IndieNews (Français)" → uid: `https://news.indieweb.org/fr`

### File Structure

```
indiekit-syndicator-indienews/
├── index.js              # Plugin class
├── lib/
│   └── indienews.js      # Webmention client
├── assets/
│   └── icon.svg          # IndieNews logo
├── package.json
└── README.md
```

## Template Requirement

The Eleventy theme must render `mp-syndicate-to` URLs as hidden `u-syndication` links for IndieNews to accept the webmention.

Add to `_includes/layouts/post.njk` after the bridgy content section:

```njk
{# Pending syndication targets (for IndieNews) #}
{% if mpSyndicateTo %}
<div class="hidden">
  {% for url in mpSyndicateTo %}
    {% if "news.indieweb.org" in url %}
    <a href="{{ url }}" class="u-syndication" rel="syndication">IndieNews</a>
    {% endif %}
  {% endfor %}
</div>
{% endif %}
```

## Syndication Flow

1. User creates post with `mp-syndicate-to: https://news.indieweb.org/en`
2. Post published to store (GitHub)
3. Eleventy builds with `u-syndication` link (from `mpSyndicateTo`)
4. `/syndicate` endpoint called
5. Plugin sends webmention to IndieNews
6. IndieNews returns permalink (e.g., `https://news.indieweb.org/en/example.com/post`)
7. Post updated: `mpSyndicateTo` removed, `syndication` gets permalink

## API Details

### Webmention Endpoint

```
POST https://news.indieweb.org/{lang}/webmention
Content-Type: application/x-www-form-urlencoded

source={postUrl}&target=https://news.indieweb.org/{lang}
```

### Success Response

```json
{
  "result": "success",
  "notices": [],
  "data": {
    "title": "Post Title",
    "author": "example.com",
    "date": "2026-01-31T12:00:00+00:00"
  },
  "source": "https://example.com/post",
  "url": "https://news.indieweb.org/en/example.com/post"
}
```

## Supported Languages

| Code | Name |
|------|------|
| en | English |
| fr | Français |
| de | Deutsch |
| es | Español |
| ja | 日本語 |
| zh | 中文 |

## Dependencies

- `@indiekit/error` - Standardized error handling

No external API client libraries needed (uses native `fetch`).
