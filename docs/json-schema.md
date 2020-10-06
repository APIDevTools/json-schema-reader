`JsonSchema` Object
===========================
JSON Schema Reader returns a `JsonSchema` object, which contains details about all the files, resources, anchors, and references in the schema.

> **TIP:** Read [Understanding Schema Structure](schema-structure.md) to learn how all the different objects in our object model are related.


Source Code
----------------
You can view the source code for the `JsonSchema` object [here](https://github.com/APIDevTools/json-schema/blob/master/src/json-schema.ts).



Properties
----------------------

### `files` <small>(array of [`File` objects](file.md))</small>
This is an array of all the files in the schema, including the root file and any files referenced by `$ref` pointers.

```javascript
for (let file of schema.files) {
  console.log(file.path);
}
```


### `rootFile` <small>([`File` object](file.md))</small>
The root file of the schema. This is the first file that was read. All other files are referenced either directly or indirectly by this file.

```javascript
console.log(schema.rootFile.path);
```


### `rootResource` <small>([`Resource` object](resource.md))</small>
The [root resource](http://json-schema.org/draft/2019-09/json-schema-core.html#root) of the root file. This is the easiest way to access the top-level schema data.

```javascript
console.log(schema.rootResoure.uri);
```


### `resources` <small>(iterable of [`Resource` objects](resource.md))</small>
Iterates over every resource in every file of the schema.

```javascript
for (let resource of schema.resources) {
  console.log(resource.uri.href);
}
```


### `hasErrors` <small>(boolean)</small>
Indicates whether there are any errors in any file in the schema.

```javascript
if (schema.hasErrors) {
  console.warn("There were errors!");
}
```


### `errors` <small>(iterable of [`SchemaError` objects](schema-error.md))</small>
Iterates over every error in every file of the schema.

```javascript
for (let error of schema.errors) {
  console.error(error.message);
}
```


Methods
----------------------

### `hasFile(location)`
Determines whether the specified file is in the schema.

- `location` (string or [`URL` object](https://developer.mozilla.org/en-US/docs/Web/API/URL))<br>
  The absolute or relative path or URL of the file to check for.

- Return value (boolean)

```javascript
if (schema.hasFile("subdir/some-file.json")) {
  console.log("Found it!");
}
```


### `getFile(location)`
Returns the specified file in the schema.

- `location` (string or [`URL` object](https://developer.mozilla.org/en-US/docs/Web/API/URL))<br>
  The absolute or relative path or URL of the file to return.

- Return value ([`File` object](file.md) or `undefined`)

```javascript
let file = schema.getFile("subdir/some-file.json");

if (file) {
  console.log(file.path);
}
```


### `hasResource(uri)`
Determines whether the specified [resource](schema-structure.md#resources) exists in the schema.

- `uri` (string or [`URL` object](https://developer.mozilla.org/en-US/docs/Web/API/URL))<br>
  The absolute, canonical URI of the resource to check for. Note that whereas the `hasFile()` method accepts relative paths, filesystem paths, or URLs, the `hasResource()` method _only_ accepts the full canonical resource URI.

- Return value (boolean)

```javascript
if (schema.hasResource("http://example.com/schemas/person")) {
  console.log("Found the person resource");
}
```


### `getResource(uri)`
Returns the specified [resource](schema-structure.md#resources) in the schema.

- `uri` (string or [`URL` object](https://developer.mozilla.org/en-US/docs/Web/API/URL))<br>
  The absolute, canonical URI of the resource to return. Note that whereas the `getFile()` method accepts relative paths, filesystem paths, or URLs, the `getResource()` method _only_ accepts the full canonical resource URI.

- Return value (boolean)

```javascript
let person = schema.getResource("http://example.com/schemas/person");

if (person) {
  console.log(person.data);
}
```


### `index([versionNumber])`
Re-indexes the schema's contents. That is, it scans all files and records all JSON Schema resources, anchors, and references in them.

This method is useful if you edit the schema's contents (e.g. the `schema.rootResource.data` property) in a way that changes the resources, anchors, or references in it.

- `versionNumber` (optional string)<br>
  The [JSON Schema version number](http://json-schema.org/specification-links.html#table-of-all-versions-of-everything) to use (e.g. `draft-04`, `2019-09`, `latest`, `auto`). The version number determines which keywords are supported, URI resolution rules, and other aspects of indexing. The default is `auto`, which attempts to automatically determine the version number via the `$schema` keyword. An error will be thrown if there is no `$schema` keyword.

- Return value (`JsonSchema` object)<br>
  The `index()` method updates the `JsonSchema` object and all of its files, resources, anchors, and references in-place. The same `JsonSchema` instance is returned to allow for chaining.

```javascript
// Index using auto-detected version
schema.index();

// Index using a specific version
schema.index("2019-09");
```


### `resolve(uri)`
Resolves a URI to a value in the schema. This method can return any value at any location in any file in the schema. It works the same way as the `$ref` keyword.

- `uri` (string or [`URL` object](https://developer.mozilla.org/en-US/docs/Web/API/URL))<br>
  An absolute or relative URI (relative to the root of the schema). The URI can be a file URL, a resource URI, an anchor URI, or a URI with a JSON Pointer fragment. That is, it can be anything that would be valid in a `$ref`.  See [Schema identification examples](http://json-schema.org/draft/2019-09/json-schema-core.html#idExamples) for examples.

- Return value ([`Resolution` object](resolution.md))<br>
  The returned object contains the resolved value, information about the value's location, and details about how the value was resolved, including every `$ref` that was followed along the way.

```javascript
// Find a file in the schema via its URL
let file = schema.resolve("some-file.json");

// Find a resource in the schema via its URI
let person = schema.resolve("person");

// Find a sub-schema using an $anchor
let address = schema.resolve("#address");

// Get a specific value in the schema using a JSON Pointer
let value = schema.resolve("#/$defs/address/properties/city");

// Show the resolved value
console.log(value.data);

// Show where it was found
console.log(value.file.path, value.locationInFile.path);
```


### `isJsonSchema(value)`
This is a static method of the `JsonSchema` class. It determines whether the given value is a `JsonSchema` instance. Simply using `instanceof JsonSchema` is insufficient, since there may be multiple versions of the `@apidevtools/json-schema` package in the `node_modules` folder and thus multiple `JsonSchema` classes in memory.

- `value` (any value)<br>
  The thing that you suspect might be a `JsonSchema` object

- Return value (boolean)<br>
  Returns `true` if `value instanceof JsonSchema` or if `value` is an object with the same structure as a `JsonSchema` object (i.e. ["duck typing"](https://en.wikipedia.org/wiki/Duck_typing)).

```javascript
if (JsonSchema.isJsonSchema(something)) {
  // It's IS a JsonSchema object, so it's safe to use
  console.log(something.rootResource.uri);
}
```
