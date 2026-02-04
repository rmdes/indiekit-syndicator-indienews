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
   * Submit a post to IndieNews via webmention
   * @param {string} postUrl - URL of the post to submit
   * @returns {Promise<string>} IndieNews permalink URL
   * @throws {Error} If submission fails
   */
  async submit(postUrl) {
    const webmentionEndpoint = `${this.baseUrl}/webmention`;

    const response = await fetch(webmentionEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        source: postUrl,
        target: this.baseUrl,
      }),
    });

    /** @type {object} */
    const data = await response.json();

    if (data.result === "success") {
      // Return the IndieNews permalink
      return data.url;
    }

    // Build error message from notices or use generic message
    const errorMessage =
      data.notices?.length > 0
        ? data.notices.join(", ")
        : data.error || "Submission to IndieNews failed";

    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
}
