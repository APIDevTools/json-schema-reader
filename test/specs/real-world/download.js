"use strict";

const { readJsonSchema } = require("../../../");
const { host } = require("@jsdevtools/host-environment");
const fetch = host.global.fetch || require("node-fetch");

const download = module.exports = {
  /**
   * Downloads a list of over 2000 real-world Swagger APIs from apis.guru,
   * and applies some custom filtering logic to it.
   */
  async listOfAPIs () {
    let response = await fetch("https://api.apis.guru/v2/list.json");

    if (!response.ok) {
      throw new Error("Unable to downlaod real-world APIs from apis.guru");
    }

    let apiMap = await response.json();

    // Flatten the API object structure into an array containing the latest version of each API
    let apiArray = [];

    for (let [name, api] of Object.entries(apiMap)) {
      let latestVersion = api.versions[api.preferred];
      apiArray.push({ name, url: latestVersion.swaggerUrl });
    }

    return apiArray;
  },

  /**
   * Downloads an API definition from apis.guru.
   * Up to 3 download attempts are made before giving up.
   */
  async api (url, retries = 2) {
    try {
      return await readJsonSchema(url);
    }
    catch (error) {
      if (error.code !== "ERR_READ") {
        throw error;
      }

      if (retries === 0) {
        console.error("        failed to download.  giving up.");
      }
      else {
        // Wait a few seconds, then try the download again
        console.error("        failed to download.  trying again...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return download.api(url, retries - 1);
      }
    }
  }
};
