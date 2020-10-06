import { JsonSchema } from "@apidevtools/json-schema";
import { MultiError } from "./multi-error";
import { normalizeOptions, Options } from "./options";
import { processFile } from "./process-file";

/**
 * Reads a multi-file JSON Schema from any combination of files, URLs, and other sources
 *
 * @param location
 * The path of the JSON Schema to read. By default, this can be a filesystem path or a web URL.
 * A custom `readFile` implementation can provide support for additional locations, such as a
 * database, CMS, RSS feed, etc.
 *
 * @param options - Options that customize the behavior and override/extend default implementations.
 */
export async function readJsonSchema(location: string | URL, options?: Options): Promise<JsonSchema> {
  let opt = normalizeOptions(options);

  let schema = new JsonSchema({
    cwd: opt.cwd,
    path: location,
  });

  await processFile(schema.rootFile, opt);

  if (opt.continueOnError && schema.hasErrors) {
    throw new MultiError(schema);
  }

  return schema;
}
