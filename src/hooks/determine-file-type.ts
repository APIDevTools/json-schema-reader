import { File } from "@apidevtools/json-schema";
import { createHelpers, Helpers } from "../helpers";
import { FileType, NormalizedOptions } from "../options";

/**
 * This RegExp pattern matches text-based media types like:
 *
 *    - text/plain
 *    - text/x-markdown
 *    - application/json
 *    - application/xml
 *    - application/xhtml+xml
 *    - image/svg+xml; charset=utf-8
 *    - application/vnd.github.v3.raw+json
 */
const textMediaTypes = /(\btext\/|\/(javascript|json|xml|svg)\b|\+(json|xml)\b)/i;

// Matches common text-based file extensions
const textExtensions = /\.(txt|jsx?|tsx?|mdx?|json|yml|yaml|html?|xml|xslt?|svg|csv|tsv)$/i;


/**
 * Determines whether a file should be read as binary or text
 */
export function determineFileType(file: File, options: NormalizedOptions): FileType {
  let type: FileType;
  let helpers = createHelpers({ file, options,
    code: "ERR_FILE_TYPE",
    message: `Unable to determine the file type of ${file}`,
    determineFileType: defaultDetermineFileType,
  });

  try {
    if (options.determineFileType) {
      // Call the custom implementation
      type = options.determineFileType.call(undefined, file, helpers);
    }
    else {
      // Call the default implementation
      type = defaultDetermineFileType(file, helpers);
    }

    // Treat anything other than "text" as binary
    if (type !== "text") {
      type = "binary";
    }

    return type;
  }
  catch (error) {
    helpers.handleError(error);
    return "binary";
  }
}


/**
 * Determines whether a file should be read as binary or text, based on its media type
 */
export function defaultDetermineFileType(file: File, _helpers: Helpers): FileType {
  if (textMediaTypes.test(file.mediaType) || textExtensions.test(file.url.pathname)) {
    return "text";
  }
  else {
    return "binary";
  }
}
