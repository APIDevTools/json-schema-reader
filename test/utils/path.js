/* eslint-env node, browser */
"use strict";

const { host } = require("@jsdevtools/host-environment");

if (host.node) {
  module.exports = nodePathHelpers();
}
else {
  module.exports = browserPathHelpers();
}

/**
 * Helper functions for getting local filesystem paths in various formats
 */
function nodePathHelpers () {
  const nodePath = require("path");
  const { pathToFileURL } = require("url");

  return {
    /**
     * Returns the relative path, formatted correctly for the current OS
     */
    rel (relativePath) {
      return nodePath.normalize(relativePath);
    },

    /**
     * Returns the absolute path
     */
    abs (relativePath) {
      return nodePath.resolve(relativePath);
    },

    /**
     * Returns the path as a "file://" URL object
     */
    url (relativePath, hash = "") {
      let url = pathToFileURL(relativePath);
      url.hash = hash;
      return url;
    },

    /**
     * Returns the absolute path of the current working directory
     */
    cwd () {
      return process.cwd();
    }
  };
}

/**
 * Helper functions for getting URLs in various formats
 */
function browserPathHelpers () {
  // The URL of the base directory in Karma
  let rootURL = new URL("/base/", window.location.href);

  // The URL of the current page directory
  let cwd = new URL(".", window.location.href);

  /**
   * URI-encodes a path
   */
  function encodePath (relativePath) {
    return encodeURIComponent(relativePath).split("%2F").join("/");
  }

  return {
    /**
     * Returns the relative URL
     */
    rel (relativePath) {
      let url = this.url(relativePath);
      let relativeURL = url.href.replace(cwd.href, "");
      return relativeURL;
    },

    /**
     * Returns the absolute URL string
     */
    abs (relativePath) {
      return this.url(relativePath).href;
    },

    /**
     * Returns the absolute URL object
     */
    url (relativePath, hash = "") {
      // Encode special characters in paths
      relativePath = encodePath(relativePath);
      let url = new URL(relativePath, rootURL);
      url.hash = hash;
      return url;
    },

    /**
     * Returns the URL of the current page.
     */
    cwd () {
      return cwd;
    }
  };
}
