"use strict";

const { readJsonSchema } = require("../../../../");
const path = require("../../../utils/path");
const assert = require("../../../utils/assert");
const schemaJSON = require("./schema.json");
const parentJSON = require("./parent.json");
const childJSON = require("./child.json");

const dir = "test/specs/circular-refs/cross-reference";

describe("Circular cross-references", () => {

  it("relative path", async () => {
    let schema = await readJsonSchema(path.rel(`${dir}/schema.json`));
    assertSchema(schema,
      path.rel(`${dir}/schema.json`),
      path.rel(`${dir}/parent.json`),
      path.rel(`${dir}/child.json`),
    );
  });

  it("absolute path", async () => {
    let schema = await readJsonSchema(path.abs(`${dir}/schema.json`));
    assertSchema(schema,
      path.abs(`${dir}/schema.json`),
      path.abs(`${dir}/parent.json`),
      path.abs(`${dir}/child.json`),
    );
  });

  it("URL", async () => {
    let schema = await readJsonSchema(path.url(`${dir}/schema.json`));
    assertSchema(schema,
      path.url(`${dir}/schema.json`).href,
      path.url(`${dir}/parent.json`).href,
      path.url(`${dir}/child.json`).href,
    );
  });

  function assertSchema (schema, rootFilePath, parentPath, childPath) {
    assert.schema(schema, {
      files: [
        {
          url: path.url(`${dir}/schema.json`),
          path: rootFilePath,
          mediaType: "application/json",
          resources: [
            {
              uri: path.url(`${dir}/schema.json`),
              data: schemaJSON,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
              references: [
                {
                  value: "parent.json",
                  targetURI: path.url(`${dir}/parent.json`),
                  data: schemaJSON.$defs.parent,
                  locationInFile: {
                    tokens: ["$defs", "parent"],
                    path: "/$defs/parent",
                    hash: "#/$defs/parent",
                  },
                },
                {
                  value: "child.json",
                  targetURI: path.url(`${dir}/child.json`),
                  data: schemaJSON.$defs.child,
                  locationInFile: {
                    tokens: ["$defs", "child"],
                    path: "/$defs/child",
                    hash: "#/$defs/child",
                  },
                },
              ],
            },
          ]
        },
        {
          url: path.url(`${dir}/parent.json`),
          path: parentPath,
          mediaType: "application/json",
          resources: [
            {
              uri: path.url(`${dir}/parent`),
              data: parentJSON,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
              references: [
                {
                  value: "child.json",
                  targetURI: path.url(`${dir}/child.json`),
                  data: parentJSON.properties.children.items,
                  locationInFile: {
                    tokens: ["properties", "children", "items"],
                    path: "/properties/children/items",
                    hash: "#/properties/children/items",
                  },
                },
              ],
            },
          ],
        },
        {
          url: path.url(`${dir}/child.json`),
          path: childPath,
          mediaType: "application/json",
          resources: [
            {
              uri: path.url(`${dir}/child`),
              data: childJSON,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
              references: [
                {
                  value: "parent.json",
                  targetURI: path.url(`${dir}/parent.json`),
                  data: childJSON.properties.parent,
                  locationInFile: {
                    tokens: ["properties", "parent"],
                    path: "/properties/parent",
                    hash: "#/properties/parent",
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  }

});
