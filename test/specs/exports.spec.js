"use strict";

const commonJSExport = require("../../");
const { default: defaultExport } = require("../../");
const { readJsonSchema, Anchor, File, JsonSchema, MultiError, Pointer, Reference, Resource, SchemaError } = require("../../");
const { expect } = require("chai");
const { host } = require("@jsdevtools/host-environment");

describe("json-schema-reader package exports", () => {

  function isJsonSchemaReader (reader) {
    expect(reader).to.be.an("object");
    expect(reader.read).to.be.a("function").with.property("name", "readJsonSchema");
    return true;
  }

  it("should export the jsonSchemaReader object as the default CommonJS export", () => {
    if (host.node) {
      expect(commonJSExport).to.satisfy(isJsonSchemaReader);
    }
    else {
      // Browser tests are only ESM, not CommonJS
      expect(commonJSExport).to.be.a("Module");
    }

  });

  it("should export the jsonSchemaReader object as the default ESM export", () => {
    expect(defaultExport).to.satisfy(isJsonSchemaReader);
  });

  it("should export the readJsonSchema() function as a named export", () => {
    expect(readJsonSchema).to.be.a("function");
    expect(readJsonSchema.name).to.equal("readJsonSchema");
  });

  it("should re-export @apidevtools/json-schema classes as named exports", () => {
    expect(Anchor).to.be.a("function").with.property("name", "Anchor");
    expect(File).to.be.a("function").with.property("name", "File");
    expect(JsonSchema).to.be.a("function").with.property("name", "JsonSchema");
    expect(MultiError).to.be.a("function").with.property("name", "MultiError");
    expect(Pointer).to.be.a("function").with.property("name", "Pointer");
    expect(Reference).to.be.a("function").with.property("name", "Reference");
    expect(Resource).to.be.a("function").with.property("name", "Resource");
    expect(SchemaError).to.be.a("function").with.property("name", "SchemaError");
  });

  it("should not export anything else", () => {
    let namedExports = [
      "readJsonSchema", "Anchor", "File", "JsonSchema", "MultiError",
      "Pointer", "Reference", "Resource", "SchemaError"
    ];

    if (host.node) {
      expect(commonJSExport).to.have.same.keys("default", "read", ...namedExports);
    }
    else {
      expect(commonJSExport).to.have.same.keys("default", ...namedExports);
    }
  });

});
