"use strict";

const { readJsonSchema } = require("../../../../");
const path = require("../../../utils/path");
const assert = require("../../../utils/assert");
const schemaJSON = require("./schema.json");

const dir = "test/specs/circular-refs/ancestor";

describe("Circular $refs to ancestor", () => {

  it("relative path", async () => {
    let schema = await readJsonSchema(path.rel(`${dir}/schema.json`));
    assertSchema(schema, path.rel(`${dir}/schema.json`));
  });

  it("absolute path", async () => {
    let schema = await readJsonSchema(path.abs(`${dir}/schema.json`));
    assertSchema(schema, path.abs(`${dir}/schema.json`));
  });

  it("URL", async () => {
    let schema = await readJsonSchema(path.url(`${dir}/schema.json`));
    assertSchema(schema, path.url(`${dir}/schema.json`).href);
  });

  function assertSchema (schema, filePath) {
    assert.schema(schema, {
      files: [{
        url: path.url(`${dir}/schema.json`),
        path: filePath,
        mediaType: "application/json",
        resources: [
          {
            uri: path.url(`${dir}/schema.json`, "#person"),
            data: schemaJSON,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
            references: [
              {
                value: "schema.json#person",
                targetURI: path.url(`${dir}/schema.json`, "#person"),
                data: schemaJSON.properties.spouse,
                locationInFile: {
                  tokens: ["properties", "spouse"],
                  path: "/properties/spouse",
                  hash: "#/properties/spouse",
                },
              },
              {
                value: "schema.json",
                targetURI: path.url(`${dir}/schema.json`),
                data: schemaJSON.properties.children.items,
                locationInFile: {
                  tokens: ["properties", "children", "items"],
                  path: "/properties/children/items",
                  hash: "#/properties/children/items",
                },
              },
            ],
          },
        ]
      }],
    });
  }

});
