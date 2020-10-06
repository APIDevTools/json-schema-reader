"use strict";

const { readJsonSchema } = require("../../../../");
const path = require("../../../utils/path");
const assert = require("../../../utils/assert");
const schemaJSON = require("./schema.json");

const dir = "test/specs/circular-refs/direct";

describe("Circular $refs to itself", () => {

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
        data: schemaJSON,
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
                value: "schema.json",
                targetURI: path.url(`${dir}/schema.json`),
                data: schemaJSON,
                locationInFile: {
                  tokens: [],
                  path: "",
                  hash: "#",
                },
              },
            ],
          },
        ]
      }],
    });
  }

});
