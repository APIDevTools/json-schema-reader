import { JsonSchema, SchemaError } from "@apidevtools/json-schema";

// TODO: Extend from AggregateError instead, once it's supported in Node
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError

/**
 * An error that wraps multiple other errors. This error type is thrown when the
 * `continueOnError` option is enabled and one or more errors occur.
 */
export class MultiError extends Error {
  /**
   * A string that identifies the type of error
   */
  public code: string;

  /**
   * The JSON schema, including all files that were successfully read
   */
  public schema: JsonSchema;

  /**
   * All errors that occurred while reading the schema
   */
  public errors: SchemaError[];


  public constructor(schema: JsonSchema) {
    let errors = [...schema.errors];
    let plural = errors.length > 1 ? "errors" : "error";
    super(`${errors.length} ${plural} occurred while reading ${schema.rootFile}`);

    this.name = "MultiError";
    this.code = "ERR_MULTIPLE";
    this.schema = schema;
    this.errors = errors;
  }
}
