`File` Object
===========================
The [`JsonSchema` object](json-schema.md) contains an array of `File` objects — one for each physical file on disk or URL that was downloaded.

> **TIP:** Read [Understanding Schema Structure](schema-structure.md) to learn how all the different objects in our object model are related.


Source Code
----------------
You can view the source code for the `JsonSchema` object [here](https://github.com/APIDevTools/json-schema/blob/master/src/file.ts).



Properties
----------------------

### `schema` <small>([`JsonSchema` object](json-schema.md))</small>
This is the `JsonSchema` object to which the file belongs.

```javascript
if (file.schema.rootFile === file) {
  console.log("This is the root file of the schema");
}
```


### `url` <small>([`URL` object](https://developer.mozilla.org/en-US/docs/Web/API/URL))</small>
The absolute URL of the file, parsed into its constituent parts. For filesystem files, this will be a `file://` URL.

```javascript
console.log(file.url.href);
```


### `path` <small>(string)</small>
The absolute or relative path of the file, based on the root path or URL that was provided when you called the `readJsonSchema()` function. The intent is for this to be a shorter, more user-friendly path that can be used in user-facing messages.

```javascript
const { readJsonSchema } = require("@apidevtools/json-schema-reader");

(async () => {
  // Notice that we're using a relative path when calling readJsonSchema().
  // All file paths will be based on this.
  let schema = await readJsonSchema("schemas/my-schema.json");

  // The full, absolute URLs
  console.log(schema.rootFile.url.href);  // file://absolute/path/to/schemas/my-schema.json
  console.log(schema.files[1].url.href);  // file://absolute/path/to/schemas/some-referenced-file.json

  // The nice, short, user-friendly paths
  console.log(schema.rootFile.path);      // schemas/my-schema.json
  console.log(schema.files[1].path);      // schemas/some-referenced-file.json

})();
```


### `mediaType` <small>(string)</small>
The [IANA media type](https://www.iana.org/assignments/media-types/media-types.xhtml) of the file (e.g. `application/json`, `text/yaml`, etc.). This is used to determine how to parse the file's data.

JSON Schema Reader sets this property based on the `Content-Type` header of downloaded files, and based on the file extension of local files.

```javascript
if (file.mediaType === "text/yaml") {
  console.log("This is a YAML file");
}
```


### `metadata` <small>(object)</small>
This object contains miscellaneous metadata about the file.  JSON Schema Reader populates this object differently, depending on where the file was raed from. For example, local filesystem files will contain all the properties of [`FS.Stats`](https://nodejs.org/api/fs.html#fs_class_fs_stats), whereas files that were downloaded will contain HTTP headers.

To simplify things, JSON Schema Reader adds some metadata in the form of HTTP headers, even for filesystem files:

| Metadata property name | Value
|------------------------|----------------------------------------------
| `content-location`     | The absolute file path
| `content-type`         | The [IANA media type](https://www.iana.org/assignments/media-types/media-types.xhtml) of the file, based on its file extension
| `content-length`       | The file size (in bytes)
| `last-modified`        | The date/time that the file was last modified, in [UTC String format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toUTCString)

You can also add your own metadata to this object. Some JSON Schema Reader plugins may add their own data as well.

```javascript
for (let [key, value] of Object.entries(file.metadata)) {
  console.log(`${key} = ${value}`);
}
```


### `resources` <small>(array of [`Resource` objects](resource.md))</small>
This is an array of all the [JSON Schema resources](http://json-schema.org/draft/2019-09/json-schema-core.html#id-keyword) in the file.  See [Understanding Schema Structure](schema-structure.md) to learn more about resources.

```javascript
for (let resource of file.resources) {
  console.log(resource.uri.href);
}
```


### `rootResource` <small>([`Resource` object](resource.md))</small>
The [root resource](http://json-schema.org/draft/2019-09/json-schema-core.html#root) of the file. Every file has a root resource, and some files _only_ have a root resource.

```javascript
console.log(file.rootResource.uri.href);
```


### `errors` <small>(array of [`SchemaError` objects](schema-error.md))</small>
The errors that were encountered in this file, if any.

```javascript
for (let error of file.errors) {
  console.error(error.message);
}
```


### `data` <small>(anything)</small>
The file data. This can be _any_ JavaScript value, but will usually be one of the following:

- `object`<br>
  If the file is a JSON Schema document that has already been parsed.

- `string`<br>
  If the file is in a text-based file that has not yet been parsed.
  This includes JSON, YAML, HTML, SVG, CSV, plain-text, etc.

- `ArrayBuffer`<br>
  If the file contains binary data, such as an image.

> **NOTE:** This is actually just a convenience property that points to the `data` property of the root [`Resource` object](resource.md)

```javascript
file.data = {
  $id: "person",
  title: "Person",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
  }
};
```


### `anchors` <small>(iterable of [`Anchor` objects](anchor.md))</small>
Iterates over all the [JSON Schema anchors](http://json-schema.org/draft/2019-09/json-schema-core.html#anchor) (i.e. `$anchor`) in every resource in the file.

```javascript
for (let anchor of file.anchors) {
  console.log(anchor.uri.href);
}
```


### `references` <small>(iterable of [`Reference` objects](reference.md))</small>
Iterates over all the [JSON Schema references](http://json-schema.org/draft/2019-09/json-schema-core.html#ref) (i.e. `$ref`) in every resource in the file.

```javascript
for (let ref of file.references) {
  console.log(`${ref.locationInFile.path} points to ${ref.targetURI.href}`);
}
```



Methods
----------------------

### `hasResource(uri)`
Determines whether the specified [resource](schema-structure.md#resources) exists in the file.

- `uri` (string or [`URL` object](https://developer.mozilla.org/en-US/docs/Web/API/URL))<br>
  The absolute, canonical URI of the resource to check for.

- Return value (boolean)

```javascript
if (file.hasResource("http://example.com/schemas/person")) {
  console.log("Found the person resource");
}
```


### `getResource(uri)`
Returns the specified [resource](schema-structure.md#resources) in the file.

- `uri` (string or [`URL` object](https://developer.mozilla.org/en-US/docs/Web/API/URL))<br>
  The absolute, canonical URI of the resource to return.

- Return value (boolean)

```javascript
let person = file.getResource("http://example.com/schemas/person");

if (person) {
  console.log(person.data);
}
```


### `index([versionNumber])`
Re-indexes the file's contents. That is, it re-populates the `resources`, `anchors`, and `references` in the file.

This method is useful if you edit the file's contents (e.g. the `file.rootResource.data` property) in a way that changes the resources, anchors, or references in it.

- `versionNumber` (optional string)<br>
  The [JSON Schema version number](http://json-schema.org/specification-links.html#table-of-all-versions-of-everything) to use (e.g. `draft-04`, `2019-09`, `latest`, `auto`). The version number determines which keywords are supported, URI resolution rules, and other aspects of indexing. The default is `auto`, which attempts to automatically determine the version number via the `$schema` keyword. An error will be thrown if there is no `$schema` keyword.

- Return value (`File` object)<br>
  The `index()` method updates the `File` object and all of its resources, anchors, and references in-place. The same `File` instance is returned to allow for chaining.

```javascript
// Index using auto-detected version
file.index();

// Index using a specific version
file.index("2019-09");
```


### `isFile(value)`
This is a static method of the `File` class. It determines whether the given value is a `File` instance. Simply using `instanceof File` is insufficient, since there may be multiple versions of the `@apidevtools/json-schema` package in the `node_modules` folder and thus multiple `File` classes in memory.

- `value` (any value)<br>
  The thing that you suspect might be a `File` object

- Return value (boolean)<br>
  Returns `true` if `value instanceof File` or if `value` is an object with the same structure as a `File` object (i.e. ["duck typing"](https://en.wikipedia.org/wiki/Duck_typing)).

```javascript
if (File.isFile(something)) {
  // It's IS a File object, so it's safe to use
  console.log(something.rootResource.uri);
}
```
