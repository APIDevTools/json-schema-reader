import { readJsonSchema } from "./read-json-schema";

export { Anchor, File, JsonSchema, Pointer, Reference, Resource, SchemaError } from "@apidevtools/json-schema";
export { Helpers } from "./helpers";
export { MultiError } from "./multi-error";
export { FileType, Options } from "./options";
export { readJsonSchema };

/**
 * Reads JSON schemas from files, URLs, and other sources
 */
const jsonSchemaReader = {
  /**
   * Reads a multi-file JSON schema from any combination of files, URLs, and other sources
   */
  read: readJsonSchema,
};

export default jsonSchemaReader;

// CommonJS default export hack
/* eslint-env commonjs */
if (typeof module === "object" && typeof module.exports === "object") {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  module.exports = Object.assign(module.exports.default, module.exports);
}
