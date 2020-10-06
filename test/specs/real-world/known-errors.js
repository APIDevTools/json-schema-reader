"use strict";

module.exports = handleError;

/**
 * Re-throws the error, unless it's a known bug in an API definition on apis.guru
 */
function handleError (name, url, error) {
  for (let knownError of knownErrors) {
    if (isMatch(name, error, knownError)) {
      return;
    }
  }

  console.error(
    "\n\n========================== ERROR =============================\n\n" +
    `API Name: ${name}\n\n` +
    `Swagger URL: ${url}\n\n` +
    error.message +
    "\n\n========================== ERROR =============================\n\n"
  );
  throw error;
}

/**
 * Determines whether an error in an API definition matches a known error
 */
function isMatch (api, error, knownError) {
  if (api.includes(knownError.api)) {
    if (typeof knownError.error === "string") {
      return error.message.includes(knownError.error);
    }
    else {
      return knownError.error.test(error.message);
    }
  }
}


const knownErrors = [
  // Malformed URL
  { api: "azure.com:keyvault", error: "Invalid URL: https:// mykeyvault" },

  // $refs to external files that don't exist
  { api: "azure.com", error: /^Cannot find resource: .*\.json/ },
];
