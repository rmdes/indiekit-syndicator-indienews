import { IndiekitError } from "@indiekit/error";

import { IndieNews } from "./lib/indienews.js";

const LANGUAGE_NAMES = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  ja: "日本語",
  zh: "中文",
};

const defaults = {
  languages: ["en"],
  checked: false,
};

/**
 * IndieNews syndicator for Indiekit
 *
 * Submits posts to IndieNews via webmention.
 * @see {@link https://news.indieweb.org/how-to-submit-a-post}
 */
export default class IndieNewsSyndicator {
  name = "IndieNews syndicator";

  /**
   * @param {object} [options] - Plugin options
   * @param {string[]} [options.languages] - Language codes to register as targets
   * @param {boolean} [options.checked] - Pre-select in syndication UI
   * @param {string} [options.language] - Single language (set internally per instance)
   */
  constructor(options = {}) {
    this.options = { ...defaults, ...options };
  }

  /**
   * Environment variables required by this plugin
   * @returns {string[]} Empty array (no credentials needed)
   */
  get environment() {
    return [];
  }

  /**
   * Syndication target info for Micropub clients
   * @returns {object} Target metadata
   */
  get info() {
    const lang = this.options.language || this.options.languages[0];
    const langName = LANGUAGE_NAMES[lang] || lang.toUpperCase();

    return {
      checked: this.options.checked,
      name: `IndieNews (${langName})`,
      uid: `https://news.indieweb.org/${lang}`,
      service: {
        name: "IndieNews",
        url: "https://news.indieweb.org/",
        photo: "/assets/@rmdes-indiekit-syndicator-indienews/icon.svg",
      },
    };
  }

  /**
   * Syndicate post to IndieNews
   * @param {object} properties - JF2 post properties
   * @param {string} properties.url - Post URL to syndicate
   * @returns {Promise<string>} IndieNews permalink URL
   */
  async syndicate(properties) {
    try {
      const lang = this.options.language || this.options.languages[0];
      const indienews = new IndieNews(lang);
      return await indienews.submit(properties.url);
    } catch (error) {
      throw new IndiekitError(error.message, {
        cause: error,
        plugin: this.name,
        status: error.status || 502,
      });
    }
  }

  /**
   * Register plugin with Indiekit
   * @param {object} Indiekit - Indiekit instance
   */
  init(Indiekit) {
    // If this instance already has a specific language, just register it
    if (this.options.language) {
      Indiekit.addSyndicator(this);
      return;
    }

    // Otherwise, register one target per configured language
    for (const lang of this.options.languages) {
      const instance = new IndieNewsSyndicator({
        ...this.options,
        language: lang,
      });
      Indiekit.addSyndicator(instance);
    }
  }
}
