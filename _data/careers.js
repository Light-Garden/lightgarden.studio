const cachedFetch = require("@11ty/eleventy-fetch");

module.exports = async function() {
  let url = "https://boards-api.greenhouse.io/v1/boards/lightgarden/jobs";

  /* This returns a promise */
  return cachedFetch(url, {
    duration: "1d", // save for 1 day
    type: "json"    // we’ll parse JSON for you
  });
};