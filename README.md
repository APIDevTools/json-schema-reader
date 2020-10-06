JSON Schema Reader
==============================================
### Reads multi-file JSON Schemas from files, URLs, and other sources

[![npm](https://img.shields.io/npm/v/@apidevtools/json-schema-reader.svg)](https://www.npmjs.com/package/@apidevtools/json-schema-reader)
[![License](https://img.shields.io/npm/l/@apidevtools/json-schema-reader.svg)](LICENSE)
[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen)](https://plant.treeware.earth/APIDevTools/json-schema-reader)

[![Build Status](https://github.com/APIDevTools/json-schema-reader/workflows/CI-CD/badge.svg)](https://github.com/APIDevTools/json-schema-reader/actions)
[![Coverage Status](https://coveralls.io/repos/github/APIDevTools/json-schema-reader/badge.svg?branch=master)](https://coveralls.io/github/APIDevTools/json-schema-reader)
[![Dependencies](https://david-dm.org/APIDevTools/json-schema-reader.svg)](https://david-dm.org/APIDevTools/json-schema-reader)

[![OS and Browser Compatibility](https://apitools.dev/img/badges/ci-badges.svg)](https://github.com/APIDevTools/json-schema-reader/actions)



Features
--------------------------
- 🔱 **Read files from anywhere**<br>
Reads JSON Schemas from local files, network files, and web URLs by default. Can be extended to read from a database, FTP server, CMS, or anything else!

- 🗃 **Multi-file schemas**<br>
Split your schemas into as many files as you want, and use `$ref` to link between them.

- 📃 **Broad compatibility**<br>
Supports multiple versions of the JSON Schema spec, including the latest **2019-09 draft**, and can even auto-detect the correct version.

- 🏷**Supports any file type**<br>
Supports JSON, plain-text, and binary files by default, but can be extended to support YAML, TOML, XML, or any other file type.

- 🧩 **Fully customizable**<br>
Allows you to extend/override any part of the process. Add support for additional file locations, file types, syntaxes, schema versions, etc.

- 🧪 **Thoroughly tested**<br>
Tested on **[over 1,500 real-world schemas](https://apis.guru/browse-apis/)** from Google, Microsoft, Facebook, Spotify, etc.



Example
--------------------------
This example demonstrates reading a multi-file JSON Schema. The root file (`schema.json`) contains two `$ref`s that link to `address.json`. One of the `$ref`s use a JSON Pointer path (`#/$defs/Name`), and the other a named anchor (`#address`).

**schema.json**
```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "title": "Person",
  "properties": {
    "name": { "$ref": "types.json#/$defs/Name" },
    "address": { "$ref": "types.json#address" }
  }
}
```

**types.json**
```json
{
  "$defs": {
    "Name": {
      "title": "Name",
      "properties": {
        "first": { "type": "string" },
        "last": { "type": "string" }
      }
    },
    "Address": {
      "$anchor": "address",
      "title": "Address",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "postalCode": { "type": "string" }
      }
    }
  }
}
```

**script.js**

```javascript
const { readJsonSchema } = require("@apidevtools/json-schema-reader");

(async () => {
  // Read the schema, and all referenced files
  let schema = await readJsonSchema("schema.json");

  // List all the files in the schema
  console.log(schema.files.length);           // 2
  console.log(schema.rootFile.path);          // schema.json
  console.log(schema.files[1].path);          // types.json

  // Inspect the $refs in schema.json
  let refs = [...schema.rootFile.references];

  console.log(refs[0].locationInFile.path);   // /properties/name
  console.log(refs[0].value);                 // types.json#/$defs/Name
  console.log(refs[0].targetURI.href);        // /path/to/types.json#/$defs/Name
  console.log(refs[0].resolve().data);        // { title: "Name", properties: {...}}

  console.log(refs[1].locationInFile.path);   // /properties/address
  console.log(refs[1].value);                 // types.json#address
  console.log(refs[1].targetURI.href);        // /path/to/types.json#address
  console.log(refs[1].resolve().data);        // { title: "Address", properties: {...}}
})();
```



Installation
--------------------------
You can install JSON Schema Reader via [npm](https://docs.npmjs.com/about-npm/).

```bash
npm install @apidevtools/json-schema-reader
```



Usage
--------------------------
When using JSON Schema Reader in Node.js apps, you'll probably want to use **CommonJS** syntax:

```javascript
const { readJsonSchema } = require("@apidevtools/json-schema-reader");
```

When using a transpiler such as [Babel](https://babeljs.io/) or [TypeScript](https://www.typescriptlang.org/), or a bundler such as [Webpack](https://webpack.js.org/) or [Rollup](https://rollupjs.org/), you can use **ECMAScript modules** syntax instead:

```javascript
import { readJsonSchema } from "@apidevtools/json-schema-reader";
```


### `readJsonSchema(location, [options])`
This is an async function that reads your JSON Schema from a file path or URL. If the schema contains any `$ref`s to other files and/or URLs, then they are automatically read/downloaded as well.

#### `location` (string or [URL object](https://developer.mozilla.org/en-US/docs/Web/API/URL))
This is the location of the root file of your JSON Schema. When running in Node.js, it can be an absolute or relative filesystem path, or a URL. When running in a web browser, it can be an absolute or relative URL.

#### `options` (_optional_, [`Options` object](docs/options.md))
You can pass an [`Options` object](doc/options) as the second parameter to customize the behavior of the `readJsonSchema()` function.

#### Return value ([`JsonSchema` object](docs/json-schema.md))
This is an async function, so the return value is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), but the Promise resolves to a [`JsonSchema` object](docs/json-schema.md), which contains details about all the files, resources, anchors, and references in the schema.


### Documentation
- [Understanding the structure of a schema](docs/schema-structure.md)
  - [JsonSchema](docs/json-schema.md)
  - [File](docs/file.md)
  - [Resource](docs/resource.md)
  - [Anchor](docs/anchor.md)
  - [Reference](docs/reference.md)
  - [Pointer](docs/pointer.md)
- [Options / Customization](docs/options.md)
- [Reading files from other sources](docs/read-file.md)
- [Supporting other file types](docs/parse-file.md)
- [Error handling](docs/error-handling.md)



Browser support
--------------------------
JSON Schema Reader supports recent versions of every major web browser.  Older browsers may require [Babel](https://babeljs.io/) and/or [polyfills](https://babeljs.io/docs/en/next/babel-polyfill).

To use JSON Schema Reader in a browser, you'll need to use a bundling tool such as [Webpack](https://webpack.js.org/), [Rollup](https://rollupjs.org/), [Parcel](https://parceljs.org/), or [Browserify](http://browserify.org/). Some bundlers may require a bit of configuration, such as setting `browser: true` in [rollup-plugin-resolve](https://github.com/rollup/rollup-plugin-node-resolve).



Contributing
--------------------------
Contributions, enhancements, and bug-fixes are welcome!  [Open an issue](https://github.com/APIDevTools/json-schema-reader/issues) on GitHub and [submit a pull request](https://github.com/APIDevTools/json-schema-reader/pulls).

#### Building
To build the project locally on your computer:

1. __Clone this repo__<br>
`git clone https://github.com/APIDevTools/json-schema-reader.git`

2. __Install dependencies__<br>
`npm install`

3. __Build the code__<br>
`npm run build`

4. __Run the tests__<br>
`npm test`



License
--------------------------
JSON Schema Reader is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.

This package is [Treeware](http://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/APIDevTools/json-schema-reader) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.



Big Thanks To
--------------------------
Thanks to these awesome companies for their support of Open Source developers ❤

[![GitHub](https://apitools.dev/img/badges/github.svg)](https://github.com/open-source)
[![NPM](https://apitools.dev/img/badges/npm.svg)](https://www.npmjs.com/)
[![Coveralls](https://apitools.dev/img/badges/coveralls.svg)](https://coveralls.io)
[![Travis CI](https://apitools.dev/img/badges/travis-ci.svg)](https://travis-ci.com)
[![SauceLabs](https://apitools.dev/img/badges/sauce-labs.svg)](https://saucelabs.com)
