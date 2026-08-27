const INDIENEWS_ORIGIN = "https://news.indieweb.org";

/**
 * Resolve which IndieNews language a syndication request is for
 *
 * Indiekit selects a syndication target by comparing URL *origins*, and every
 * IndieNews language shares one. A request for `…/fr` is therefore handed to
 * whichever IndieNews target registered first, which may be `…/en`. Since the
 * webmention names the channel it is submitted to, and IndieNews requires the
 * post to link to that same channel, sending the configured language rather
 * than the requested one makes the submission fail.
 *
 * Reading the language back out of `mp-syndicate-to` keeps the webmention
 * pointed at the channel the author actually chose.
 * @param {object} properties - JF2 post properties
 * @param {string} fallback - Language to use when none was requested
 * @returns {string} Language code
 */
export const resolveLanguage = (properties, fallback) => {
  const requested = [properties?.["mp-syndicate-to"] ?? []].flat();

  for (const value of requested) {
    if (typeof value !== "string" || !URL.canParse(value)) {
      continue;
    }

    const { origin, pathname } = new URL(value);
    if (origin !== INDIENEWS_ORIGIN) {
      continue;
    }

    const [language] = pathname.split("/").filter(Boolean);
    if (language) {
      return language;
    }
  }

  return fallback;
};
