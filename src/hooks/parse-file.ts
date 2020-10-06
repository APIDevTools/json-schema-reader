import { File } from "@apidevtools/json-schema";
import { createHelpers, Helpers } from "../helpers";
import { NormalizedOptions } from "../options";

/**
 * This RegExp pattern matches JSON media types like:
 *
 *    - text/json
 *    - application/json
 *    - application/vnd.oai.openapi+json
 *    - application/json; charset=utf-8
 *    - application/vnd.github.v3.raw+json
 */
const jsonMediaType = /\/json\b|\+json\b/i;


/**
 * Parses a file's contents
 */
export function parseFile(file: File, options: NormalizedOptions): void {
  let helpers = createHelpers({ file, options,
    code: "ERR_PARSE",
    message: `Unable to parse ${file}`,
    parseFile: defaultParseFile,
  });

  try {
    if (options.parseFile) {
      // Call the custom implementation
      options.parseFile.call(undefined, file, helpers);
    }
    else {
      // Call the default implemenation
      defaultParseFile(file, helpers);
    }
  }
  catch (error) {
    helpers.handleError(error);
  }
}


/**
 * Parses JSON files
 */
export function defaultParseFile(file: File, _helpers: Helpers): void {
  // Determine if this is a JSON file
  let isText = typeof file.data === "string";
  let isJSON = file.url.pathname.endsWith(".json") || jsonMediaType.test(file.mediaType);

  if (isText && isJSON) {
    // It's a JSON file, so parse it
    file.data = JSON.parse(file.data as string) as unknown;
  }
}
