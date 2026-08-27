import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { resolveLanguage } from "../lib/language.js";

describe("indiekit-syndicator-indienews/lib/language", () => {
  it("Uses the language of the requested IndieNews target", () => {
    const properties = {
      "mp-syndicate-to": ["https://news.indieweb.org/fr"],
    };

    // Indiekit matches syndication targets by URL origin, and every IndieNews
    // language shares one. A request for French can therefore be handed to the
    // English target, which would send a webmention for the wrong channel.
    assert.equal(resolveLanguage(properties, "en"), "fr");
  });

  it("Accepts a single value as well as an array", () => {
    const properties = { "mp-syndicate-to": "https://news.indieweb.org/de" };

    assert.equal(resolveLanguage(properties, "en"), "de");
  });

  it("Ignores a trailing slash", () => {
    const properties = { "mp-syndicate-to": ["https://news.indieweb.org/fr/"] };

    assert.equal(resolveLanguage(properties, "en"), "fr");
  });

  it("Ignores targets that are not IndieNews", () => {
    const properties = {
      "mp-syndicate-to": ["https://mastodon.example/@user"],
    };

    assert.equal(resolveLanguage(properties, "en"), "en");
  });

  it("Falls back when no target was requested", () => {
    assert.equal(resolveLanguage({}, "en"), "en");
    assert.equal(resolveLanguage({ "mp-syndicate-to": [] }, "en"), "en");
  });

  it("Falls back when the IndieNews URL names no language", () => {
    const properties = { "mp-syndicate-to": ["https://news.indieweb.org/"] };

    assert.equal(resolveLanguage(properties, "en"), "en");
  });

  it("Ignores a value that is not a URL", () => {
    const properties = { "mp-syndicate-to": ["not-a-url"] };

    assert.equal(resolveLanguage(properties, "en"), "en");
  });
});
