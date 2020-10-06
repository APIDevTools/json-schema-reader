`Anchor` Object
===========================
An `Anchor` object represents a [JSON Schema anchor](http://json-schema.org/draft/2019-09/json-schema-core.html#anchor) (i.e. `$anchor`) in a [resource](resource.md).

> **TIP:** Read [Understanding Schema Structure](schema-structure.md) to learn how all the different objects in our object model are related.


Source Code
----------------
You can view the source code for the `JsonSchema` object [here](https://github.com/APIDevTools/json-schema/blob/master/src/anchor.ts).



Properties
----------------------

### `schema` <small>([`JsonSchema` object](json-schema.md))</small>
This is the `JsonSchema` object that contains this anchor.

```javascript
if (anchor.schema.rootResource === anchor.resource) {
  console.log("This anchor is in the root resource of the schema");
}
```


### `file` <small>([`File` object](file.md))</small>
This is the `File` object that contains this anchor.

```javascript
console.log(`This anchor is in ${anchor.file.path}`);
```


### `resource` <small>([`Resource` object](resource.md))</small>
This is the `Resource` object that contains this anchor.

```javascript
console.log(`This anchor is in ${anchor.resource.uri.href}`);
```



> ### ⚠ INCOMPLETE DOCS ⚠
> There's more to this object, but the rest of this page has not yet been written.
