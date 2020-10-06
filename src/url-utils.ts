/**
 * A regular expression to test whether a string is an absolute URL
 */
export const absoluteUrlPattern = /^(\w{2,}):\/\//;


/**
 * Returns a copy of the given URL, without a hash
 */
export function removeHash(url: URL): URL {
  let copy = new URL(url.href);
  copy.hash = "";
  return copy;
}


/**
 * Returns the relative URL between two absolute URLs, if possible.
 *
 * NOTE: This implementation is based on "url-relative" by Juno Suárez
 *
 * @see https://github.com/junosuarez/url-relative
 * @see https://tools.ietf.org/html/rfc1808
 */
export function relativeURL(from: URL, to: URL): string | undefined {
  if (
    from.host !== to.host ||
    from.protocol !== to.protocol ||
    from.username !== to.username ||
    from.password !== to.password
  ) {
    // There is no relative URL between these two
    return undefined;
  }

  // left to right, look for closest common path segment
  let fromPath = from.pathname;
  let toPath = to.pathname;
  let fromSegments = fromPath.substr(1).split("/");
  let toSegments = toPath.substr(1).split("/");

  while (fromSegments[0] === toSegments[0]) {
    fromSegments.shift();
    toSegments.shift();
  }

  let length = fromSegments.length - toSegments.length;
  if (length > 0) {
    if (fromPath.endsWith("/")) {
      toSegments.unshift("..");
    }
    while (length--) {
      toSegments.unshift("..");
    }
    return toSegments.join("/");
  }
  else if (length < 0) {
    return toSegments.join("/");
  }
  else {
    length = toSegments.length - 1;
    while (length--) {
      toSegments.unshift("..");
    }
    return toSegments.join("/");
  }
}


/**
 * Resolves a relative URL, relative to a base URL
 */
export function resolveRelativeURL(base: string, relative: string): string {
  let baseSegments = base.split("/");
  let relativeSegments = relative.split("/");

  // Remove the last segment if it's a file name
  if (baseSegments[baseSegments.length - 1] !== "") {
    baseSegments.pop();
  }

  for (let segment of relativeSegments) {
    if (segment === ".") continue;

    if (segment === ".." && baseSegments.length > 0) {
      baseSegments.pop();
    }
    else {
      baseSegments.push(segment);
    }
  }

  return baseSegments.join("/");
}
