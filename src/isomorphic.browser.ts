/* eslint-env browser */
/// <reference lib="dom" />

import { resolveRelativeURL } from "./url-utils";


/**
 * Returns the URL of the current web page
 */
export function getCWD(): string {
  return window.location.href;
}


/**
 * Resolves the path of a file, relative to another file
 */
export function resolveFilePath(base: string, relative: string): string {
  return resolveRelativeURL(base, relative);
}


/**
 * In web browsers, we always use the browser's `fetch()` implementation
 */
export function getFetchImplementation() {
  return fetch;
}
