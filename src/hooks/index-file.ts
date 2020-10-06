import { File, jsonSchema, SchemaError } from "@apidevtools/json-schema";
import { createHelpers, Helpers } from "../helpers";
import { NormalizedOptions } from "../options";

/**
 * Indexes a file's contents
 */
export function indexFile(file: File, options: NormalizedOptions): void {
  let helpers = createHelpers({ file, options,
    code: "ERR_INDEX",
    indexFile: defaultIndexFile,
  });

  try {
    if (options.indexFile) {
      // Call the custom implementation
      options.indexFile.call(undefined, file, helpers);
    }
    else {
      // Call the default implemenation
      defaultIndexFile(file, helpers);
    }
  }
  catch (error) {
    helpers.handleError(error);
  }
}


/**
 * The default implementation of the `indexFile` hook.  It first tries to auto-detect the
 * JSON Schema version.  If that fails, then it falls-back to the latest version of JSON Schema.
 */
export function defaultIndexFile(file: File, helpers: Helpers): void {
  try {
    // Default to auto-detecting the JSON Schema version
    jsonSchema.auto.indexFile(file, helpers);
  }
  catch (error) {
    if ((error as SchemaError).code === "ERR_SCHEMA_VERSION") {
      // We were unable to auto-detect the JSON Schema version,
      // so try again using the latest version of JSON Schema
      jsonSchema.latest.indexFile(file, helpers);
    }
    else {
      throw error;
    }
  }
}
