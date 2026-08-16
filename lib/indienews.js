/**
 * IndieNews webmention client
 * @see {@link https://news.indieweb.org/how-to-submit-a-post}
 */
export class IndieNews {
  /**
   * @param {string} language - Language code (e.g., "en", "fr")
   */
  constructor(language) {
    this.language = language;
    this.baseUrl = `https://news.indieweb.org/${language}`;
  }

  /**
   * Resolve a post URL to the address it is actually served from, and confirm
   * the post links to IndieNews.
   *
   * IndieNews fetches the `source` URL and looks for a link to `target` in the
   * markup it finds there. Submitting a URL that redirects — for example a path
   * missing the trailing slash a site canonicalises to — means IndieNews reads
   * the redirect response rather than the post, and rejects it with
   * `no_link_found` even though the post itself is correct.
   * @param {string} postUrl - URL of the post to submit
   * @returns {Promise<string>} URL the post is served from
   * @throws {Error} If the post is unreachable or does not yet link to IndieNews
   */
  async resolveSource(postUrl) {
    let response;

    try {
      response = await fetch(postUrl, {
        headers: { Accept: "text/html" },
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
      });
    } catch (cause) {
      const error = new Error(`Could not fetch ${postUrl}: ${cause.message}`);
      error.cause = cause;
      throw error;
    }

    if (!response.ok) {
      const error = new Error(
        `Post is not available yet (${postUrl} returned ${response.status})`,
      );
      error.status = response.status;
      throw error;
    }

    const html = await response.text();

    // A post that hasn’t been rebuilt with the IndieNews link yet isn’t an
    // error, it just isn’t ready. Failing here leaves the target in
    // mp-syndicate-to so it is retried on a later cycle.
    if (!html.includes(this.baseUrl)) {
      throw new Error(
        `Post does not link to ${this.baseUrl} yet — a u-syndication or ` +
          `u-category link must be published before submitting`,
      );
    }

    // Submit the URL the post was actually served from, after any redirects
    return response.url || postUrl;
  }

  /**
   * Submit a post to IndieNews via webmention
   * @param {string} postUrl - URL of the post to submit
   * @returns {Promise<string>} IndieNews permalink URL
   * @throws {Error} If submission fails
   */
  async submit(postUrl) {
    const source = await this.resolveSource(postUrl);
    const webmentionEndpoint = `${this.baseUrl}/webmention`;

    const response = await fetch(webmentionEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        source,
        target: this.baseUrl,
      }),
    });

    /** @type {object} */
    let data;
    try {
      data = await response.json();
    } catch {
      // Endpoint is documented to return JSON, but don’t mask the HTTP status
      // behind a parse error if it ever doesn’t
      data = {};
    }

    if (data.result === "success") {
      // Return the IndieNews permalink
      return data.url;
    }

    // Build error message from notices or use generic message
    const errorMessage =
      data.notices?.length > 0
        ? data.notices.join(", ")
        : data.error || `Submission to IndieNews failed (${response.status})`;

    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
}
