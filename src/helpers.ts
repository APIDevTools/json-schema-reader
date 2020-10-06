import { createErrorHandler, File, Helpers as JsonSchemaHelpers } from "@apidevtools/json-schema";
import { determineFileType } from "./hooks/determine-file-type";
import { indexFile } from "./hooks/index-file";
import { parseFile } from "./hooks/parse-file";
import { readFile } from "./hooks/read-file";
import { FileType, NormalizedOptions } from "./options";


/**
 * Helpful information and utilities that are passed to all custom functions
 */
export interface Helpers extends JsonSchemaHelpers {
  /**
   * The current working directory. In web browsers, this is the URL of the current page.
   */
  cwd: string;

  /**
   * Options that determine the behavior when downloading files over HTTP(s) or similar protocols.
   * Some of these options only apply when running in a web browser, not in Node.js.
   */
  http: RequestInit;

  /**
   * Calls the default `readFile` implementation, which can download files from HTTP and HTTPS URLs,
   * and can read files from the filesystem in Node.js.
   */
  readFile(file: File, helpers: Helpers): Promise<void> | void;

  /**
   * Calls the default `determineFileType` implementation, which supports many common text and
   * binary file formats.
   */
  determineFileType(file: File, helpers: Helpers): FileType | void;

  /**
   * Calls the default `parseFile` implementation, which can only parse JSON files.
   */
  parseFile(file: File, helpers: Helpers): void;

  /**
   * Calls the default `indexFile` implementation, which attempts to determine the appropriate
   * version of the JSON Schema spec, and indexes the file according to that spec version.
   */
  indexFile(file: File, helpers: Helpers): void;
}


/**
 * Determines how the `Helpers` object is created
 */
export interface HelperConfig {
  file: File;
  code: string;
  message?: string;
  options: NormalizedOptions;
  readFile?(file: File, helpers: Helpers): Promise<void> | void;
  determineFileType?(file: File, helpers: Helpers): FileType | void;
  parseFile?(file: File, helpers: Helpers): void;
  indexFile?(file: File, helpers: Helpers): void;
}


/**
 * Creates the `Helpers` object that gets passed to all custom functions
 */
export function createHelpers(config: HelperConfig): Helpers {
  let { file, code, message, options } = config;
  let { continueOnError } = options;

  return {
    cwd: options.cwd,
    http: options.http,
    readFile: config.readFile || ((f) => readFile(f, options)),
    determineFileType: config.determineFileType || ((f) => determineFileType(f, options)),
    parseFile: config.parseFile || ((f) => parseFile(f, options)),
    indexFile: config.indexFile || ((f) => indexFile(f, options)),
    handleError: createErrorHandler({ file, code, message, continueOnError }),
  };
}
