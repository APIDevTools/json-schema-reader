`Resource` Object
===========================
Every [`File`](file.md) in a [`JsonSchema` object](json-schema.md) contains an array of `Resource` objects. Each `Resource` object represents a [JSON Schema Resource](http://json-schema.org/draft/2019-09/json-schema-core.html#id-keyword) in the file.  Every file has at least one resource.

> **TIP:** Read [Understanding Schema Structure](schema-structure.md) to learn how all the different objects in our object model are related.


Source Code
----------------
You can view the source code for the `JsonSchema` object [here](https://github.com/APIDevTools/json-schema/blob/master/src/resource.ts).



Properties
----------------------

### `schema` <small>([`JsonSchema` object](json-schema.md))</small>
This is the `JsonSchema` object that contains this resource.

```javascript
if (resource.schema.rootResource === resource) {
  console.log("This is the root resource of the schema");
}
```


### `file` <small>([`File` object](file.md))</small>
This is the `File` object that contains this resource.

```javascript
console.log(`This resource is in ${resource.file.path}`);
```


### `uri` <small>([`URL` object](https://developer.mozilla.org/en-US/docs/Web/API/URL))</small>
The absolute, canonical [UR**I** (Uniform Resource Identifier)](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier) of the resource. Note that this does _not_ necessarily correspond to a physical file on disk, or a [UR**L** (Uniform Resource Locator)](https://en.wikipedia.org/wiki/URL) that can be downloaded.

```javascript
console.log(resource.uri.href);
```


### `locationInFile` <small>([`Pointer` object](pointer.md))</small>
A [JSON Pointer](https://tools.ietf.org/html/rfc6901) that indicates the resource's location in the file.

```javascript
console.log(`This resource is at ${resource.locationInFile.path} in ${resource.file}`);
```


### `data` <small>(anything)</small>
The resource data. This can be _any_ JavaScript value, but will usually be one of the following:

- `object`<br>
  If the resource is a JSON Schema document that has already been parsed.

- `string`<br>
  If the resource is in text-based data that has not yet been parsed.
  This includes JSON, YAML, HTML, SVG, CSV, plain-text, etc.

- `ArrayBuffer`<br>
  If the resource contains binary data, such as an image.

```javascript
resource.data = {
  $id: "person",
  title: "Person",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
  }
};
```


### `anchors` <small>(array of [`Anchor` objects](anchor.md))</small>
An array of all the [JSON Schema anchors](http://json-schema.org/draft/2019-09/json-schema-core.html#anchor) (i.e. `$anchor`) in the resource.

```javascript
for (let anchor of resource.anchors) {
  console.log(anchor.uri.href);
}
```


### `references` <small>(iterable of [`Reference` objects](reference.md))</small>
An array of all the [JSON Schema references](http://json-schema.org/draft/2019-09/json-schema-core.html#ref) (i.e. `$ref`) in the resource.

```javascript
for (let ref of resource.references) {
  console.log(`${ref.locationInFile.path} points to ${ref.targetURI.href}`);
}
```
