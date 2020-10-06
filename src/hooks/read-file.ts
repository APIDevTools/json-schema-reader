import { File } from "@apidevtools/json-schema";
import { createHelpers, Helpers } from "../helpers";
import { getFetchImplementation } from "../isomorphic.node";
import { NormalizedOptions } from "../options";

/**
 * Reads a single file from its source
 */
export async function readFile(file: File, options: NormalizedOptions): Promise<void> {
  let helpers = createHelpers({ file, options,
    code: "ERR_READ",
    message: `Unable to read ${file}`,
    readFile: defaultReadFile,
  });

  try {
    if (options.readFile) {
      // Call the custom implementation
      await options.readFile.call(undefined, file, helpers);
    }
    else {
      // Call the default implemenation
      await defaultReadFile(file, helpers);
    }
  }
  catch (error) {
    helpers.handleError(error);
  }
}


/**
 * Reads a file from the local filesystem or a web URL
 */
export async function defaultReadFile(file: File, helpers: Helpers): Promise<void> {
  // Fetch the file using the appropriate fetch implemenation,
  // based on the runtime environment and URL type
  let fetch = getFetchImplementation(file.url);
  let response = await fetch(file.url.href, helpers.http);

  if (!response.ok) {
    let { status, statusText } = response;
    throw new URIError(
      `HTTP ${status || "Error"} (${statusText || "Unknown Error"}) while fetching ${file.url.href}`);
  }

  // Update the File with info from the HTTP response
  file.mediaType = response.headers.get("Content-Type") || "";
  response.status && (file.metadata.status = response.status);
  response.statusText && (file.metadata.statusText = response.statusText);
  response.redirected && (file.metadata.redirected = response.redirected);
  response.url && (file.metadata.responseURL = response.url);

  response.headers.forEach((value, header) => {
    file.metadata[header] = value;
  });

  // Determine whether to read the response as text or binary
  let fileType = helpers.determineFileType(file, helpers);

  if (fileType === "text") {
    file.data = await response.text();
  }
  else {
    file.data = await response.arrayBuffer();
  }
}
