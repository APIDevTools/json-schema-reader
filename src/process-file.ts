import { File, JsonSchema } from "@apidevtools/json-schema";
import { indexFile } from "./hooks/index-file";
import { parseFile } from "./hooks/parse-file";
import { readFile } from "./hooks/read-file";
import { resolveFilePath } from "./isomorphic.node";
import { NormalizedOptions } from "./options";
import { relativeURL, removeHash } from "./url-utils";


/**
 * Reads a file from its source, parses it, resolves its references, and recursively processes those files
 */
export async function processFile(file: File, options: NormalizedOptions): Promise<void> {
  // Read the file from disk, network, web, etc.
  await readFile(file, options);

  // Parse the file contents
  parseFile(file, options);

  // Build an index of all JSON Schema resources, references, and anchors in the file
  indexFile(file, options);

  // Read and process any referenced files
  await processReferencedFiles(file, options);
}


/**
 * Process all new external files that are referenced in a file
 */
async function processReferencedFiles(file: File, options: NormalizedOptions): Promise<void> {
  let { schema } = file;
  let promises = [];

  for (let ref of file.references) {
    if (!alreadyExists(ref.targetURI, file.schema)) {
      // Get the URL of the target file, without the hash
      let url = removeHash(ref.targetURI);

      // Set the file path based on the current file path
      let relative = relativeURL(file.url, url);
      let path = relative ? resolveFilePath(file.path, relative) : url.href;

      // Create the new file and add it to the schema
      let newFile = new File({ schema, url, path });
      schema.files.push(newFile);

      // Start processing the file asynchronously
      promises.push(processFile(newFile, options));
    }
  }

  // Wait for all referenced files to finish processing
  await Promise.all(promises);
}


/**
 * Determines whether a file or resource with the given URL already exists in the schema
 */
function alreadyExists(url: URL, schema: JsonSchema) {
  for (let file of schema.files) {
    if (compareURLs(url, file.url)) return true;
  }
  for (let resource of schema.resources) {
    if (compareURLs(url, resource.uri)) return true;
  }
}


/**
 * Determines whether to URLs are equivalent.
 */
function compareURLs(a: URL, b: URL) {
  // Compare the two URIs piece-by-piece to short-circuit as early as possible.
  // NOTE: We don't compare the hashes because we're only interested in whole files that can be read
  return a.pathname === b.pathname &&
    a.hostname === b.hostname &&
    a.search === b.search &&
    a.port === b.port &&
    a.protocol === b.protocol;
}
