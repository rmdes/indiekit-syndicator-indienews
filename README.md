# @rmdes/indiekit-syndicator-indienews

IndieNews syndicator for [Indiekit](https://getindiekit.com/).

Submits posts to [IndieNews](https://news.indieweb.org/), a community-curated aggregator of IndieWeb-related content.

## Installation

```bash
npm install @rmdes/indiekit-syndicator-indienews
```

## Configuration

```js
// indiekit.config.js
export default {
  plugins: ["@rmdes/indiekit-syndicator-indienews"],
  "@rmdes/indiekit-syndicator-indienews": {
    languages: ["en", "fr"],  // Languages to register as syndication targets
    checked: false            // Pre-select in syndication UI
  }
};
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `languages` | `string[]` | `["en"]` | Language codes to register as syndication targets |
| `checked` | `boolean` | `false` | Whether to pre-select this target in the UI |

## Supported Languages

| Code | Name |
|------|------|
| `en` | English |
| `fr` | Français |
| `de` | Deutsch |
| `es` | Español |
| `ja` | 日本語 |
| `zh` | 中文 |

## How It Works

IndieNews uses webmentions for submission:

1. Your post must have a `u-syndication` link pointing to `https://news.indieweb.org/{lang}`
2. The plugin sends a webmention with your post URL as `source`
3. IndieNews returns a permalink URL which is stored in your post's `syndication` property

### Template Requirement

Your site template must render pending syndication targets as `u-syndication` links. For Eleventy, add this to your post template:

```njk
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

## No Credentials Required

Unlike most syndicators, IndieNews doesn't require API keys or authentication. Submission is done entirely via webmentions.

## License

MIT
