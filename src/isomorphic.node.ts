/* eslint-env node */
/// <reference types="node" />
/// <reference lib="dom" />

import { promises as fs } from "fs";
import { getType } from "mime";
import nodeFetch from "node-fetch";
import * as path from "path";
import { fileURLToPath } from "url";
import { absoluteUrlPattern, resolveRelativeURL } from "./url-utils";

const isWindows = process.platform === "win32";


// eslint-disable-next-line no-undef
type Fetch = typeof fetch;


/**
 * Returns the current working directory
 */
export function getCWD(): string {
  return process.cwd();
}


/**
 * Resolves the path of a file, relative to another file
 */
export function resolveFilePath(base: string, relative: string): string {
  if (absoluteUrlPattern.test(base)) {
    // This is a URL, not a filesystem path
    return resolveRelativeURL(base, relative);
  }

  let lastChar = base[base.length - 1];
  let dir: string;

  if (base.length === 0 || lastChar === "/" || (isWindows && lastChar === "\\")) {
    // The base path is a directory, not a file
    dir = base;
  }
  else {
    // The base path is a file, so get its directory
    dir = path.dirname(base);
  }

  // Resolve the path, relative to the base directory
  return path.join(dir, relative);
}


/**
 * Returns the appropriate `fetch()` implementation for the given URL
 */
export function getFetchImplementation(url: URL): Fetch {
  if (url.protocol === "file:") {
    return filesystemFetch;
  }
  else {
    return nodeFetch as unknown as Fetch;
  }
}


/**
 * A Fetch-compatible wrapper around `fs.readFile()`
 */
async function filesystemFetch(url: string): Promise<Response> {
  // Read the file
  let filePath = fileURLToPath(url);
  let stats = await fs.stat(filePath);
  let data = await fs.readFile(filePath);

  // Convert file stats to a Fetch-compatible Headers object
  let headers: Record<string, unknown> = {
    "content-location": filePath,
    "content-type": getType(filePath),
    "content-length": data.byteLength.toString(),
    "last-modified": stats.mtime.toUTCString(),
    ...stats,
  };

  // Return the file as a Fetch-compatible Response object
  let response = {
    ok: true,

    text() {
      return data.toString("utf8");
    },

    arrayBuffer() {
      return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    },

    headers: {
      get(headerName: string) {
        headerName = headerName.toLowerCase();
        return headers[headerName] || null;
      },

      forEach(iterator: (value: unknown, header: string) => void) {
        for (let [stat, value] of Object.entries(headers)) {
          iterator(value, stat);
        }
      }
    }
  };

  return response as unknown as Response;
}
