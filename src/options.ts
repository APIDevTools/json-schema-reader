import { File } from "@apidevtools/json-schema";
import { Helpers } from "./helpers";
import { getCWD } from "./isomorphic.node";


/**
 * JSON Schema Reader options
 */
export interface Options {
  /**
   * The directory path/URL used to resolve the root JSON scheam location, if it's a relative path/URL.
   * This defaults to `process.cwd()` in Node.js, and defaults to `window.location.href` in web brwosers.
   */
  cwd?: string;

  /**
   * Indicates whether the reader should continue reading as many files as possible,
   * even if errors are encountered. When `false` (the default) the first error is thrown.
   * When `true` and an error occurs, an error is thrown after all possible files are read,
   * and the error's `errors` property is an array of all errors that ocurred.
   */
  continueOnError?: boolean;

  /**
   * Options that determine the behavior when downloading files over HTTP(s) or similar protocols.
   * Some of these options only apply when running in a web browser, not in Node.js.
   */
  http?: RequestInit;

  /**
   * Overrides the default functionality for reading/downloading files. You can fallback to the
   * default implementation by calling `helpers.readFile()`.
   *
   * This function is responsible for and setting `file.data`, `file.mediaType`, `file.metadata`,
   * and any other relevant properties of the `file` object.
   */
  readFile?(file: File, helpers: Helpers): void | Promise<void>;

  /**
   * Overrides the default functionality for determining whether a file should be read as binary
   * or text. You can fallback to the default implementation by calling `helpers.determineFileType()`.
   *
   * @returns
   * One of the following values:
   *
   * - `"text"` if the file should be read as text. This should be used for JSON, YAML, HTML, SVG,
   *    CSV, plain-text, and other text-based file formats
   *
   * - `"binary"` if the file should be read as binary data, which is suitable for PNG, GIF, JPEG,
   *     and other binary files.
   *
   * - Any other value will be treated as binary
   */
  determineFileType?(file: File, helpers: Helpers): FileType;

  /**
   * Overrides the default functionality for parsing file contents.  You can fallback to the
   * default implementation by calling `helpers.parseFile()`.
   *
   * This function is responsible for parsing the `file.data` property and replacing it with the
   * parsed results. It may also update other relevant properties of the `file` object.
   */
  parseFile?(file: File, helpers: Helpers): void;

  /**
   * Overrides the dfeault functionality for indexing file contents.  You can fallback to the
   * default implementation by calling `helpers.indexFile()`.
   *
   * This function is responsible for populating the `File.resources` array, including the
   * `Resource.anchors` and `Resource.references` arrays of each resource.
   */
  indexFile?(file: File, helpers: Helpers): void;
}


/**
 * Indicates whether a file should be read as text or binary
 */
export type FileType = "text" | "binary";


/**
 * Normalized and sanitized options with defaults
 */
export interface NormalizedOptions extends Options {
  cwd: string;
  continueOnError: boolean;
  http: RequestInit;
}


/**
 * Normalizes and sanitizes user-provided options
 */
export function normalizeOptions(options: Options = {}): NormalizedOptions {
  let normalized: NormalizedOptions = Object.assign({}, options, {
    cwd: (options.cwd && typeof options.cwd === "string") ? options.cwd : getCWD(),
    continueOnError: Boolean(options.continueOnError),
    http: Object.assign({}, options.http),
  });

  return normalized;
}
