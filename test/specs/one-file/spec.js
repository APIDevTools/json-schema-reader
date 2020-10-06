"use strict";

const { readJsonSchema } = require("../../../");
const path = require("../../utils/path");
const assert = require("../../utils/assert");
const schemaJSON = require("./schema.json");

const dir = "test/specs/one-file";

describe("Single-file schema with internal $refs", () => {

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
            uri: path.url(`${dir}/person`),
            data: schemaJSON,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
            references: [
              {
                value: "non-empty-string",
                targetURI: path.url(`${dir}/non-empty-string`),
                data: schemaJSON.properties.name.properties.first,
                locationInFile: {
                  tokens: ["properties", "name", "properties", "first"],
                  path: "/properties/name/properties/first",
                  hash: "#/properties/name/properties/first",
                },
              },
              {
                value: "person#non-empty-string",
                targetURI: path.url(`${dir}/person`, "#non-empty-string"),
                data: schemaJSON.properties.name.properties.middle,
                locationInFile: {
                  tokens: ["properties", "name", "properties", "middle"],
                  path: "/properties/name/properties/middle",
                  hash: "#/properties/name/properties/middle",
                },
              },
              {
                value: "#/$defs/nonEmptyString",
                targetURI: path.url(`${dir}/person`, "#/$defs/nonEmptyString"),
                data: schemaJSON.properties.name.properties.last,
                locationInFile: {
                  tokens: ["properties", "name", "properties", "last"],
                  path: "/properties/name/properties/last",
                  hash: "#/properties/name/properties/last",
                },
              },
              {
                value: "address",
                targetURI: path.url(`${dir}/address`),
                data: schemaJSON.properties.homeAddress,
                locationInFile: {
                  tokens: ["properties", "homeAddress"],
                  path: "/properties/homeAddress",
                  hash: "#/properties/homeAddress",
                },
              },
              {
                value: "person#address",
                targetURI: path.url(`${dir}/person`, "#address"),
                data: schemaJSON.properties.workAddress,
                locationInFile: {
                  tokens: ["properties", "workAddress"],
                  path: "/properties/workAddress",
                  hash: "#/properties/workAddress",
                },
              },
              {
                value: "#/$defs/address",
                targetURI: path.url(`${dir}/person`, "#/$defs/address"),
                data: schemaJSON.properties.schoolAddress,
                locationInFile: {
                  tokens: ["properties", "schoolAddress"],
                  path: "/properties/schoolAddress",
                  hash: "#/properties/schoolAddress",
                },
              },
            ],
          },
          {
            uri: path.url(`${dir}/non-empty-string`),
            data: schemaJSON.$defs.nonEmptyString,
            locationInFile: {
              tokens: ["$defs", "nonEmptyString"],
              path: "/$defs/nonEmptyString",
              hash: "#/$defs/nonEmptyString",
            },
            anchors: [
              {
                name: "non-empty-string",
                uri: path.url(`${dir}/non-empty-string`, "#non-empty-string"),
                data: schemaJSON.$defs.nonEmptyString,
                locationInFile: {
                  tokens: ["$defs", "nonEmptyString"],
                  path: "/$defs/nonEmptyString",
                  hash: "#/$defs/nonEmptyString",
                }
              }
            ],
          },
          {
            uri: path.url(`${dir}/address`),
            data: schemaJSON.$defs.address,
            locationInFile: {
              tokens: ["$defs", "address"],
              path: "/$defs/address",
              hash: "#/$defs/address",
            },
            anchors: [
              {
                name: "address",
                uri: path.url(`${dir}/address`, "#address"),
                data: schemaJSON.$defs.address,
                locationInFile: {
                  tokens: ["$defs", "address"],
                  path: "/$defs/address",
                  hash: "#/$defs/address",
                }
              }
            ],
            references: [
              {
                value: "non-empty-string",
                targetURI: path.url(`${dir}/non-empty-string`),
                data: schemaJSON.$defs.address.properties.street.items,
                locationInFile: {
                  tokens: ["$defs", "address", "properties", "street", "items"],
                  path: "/$defs/address/properties/street/items",
                  hash: "#/$defs/address/properties/street/items",
                },
              },
              {
                value: "person#non-empty-string",
                targetURI: path.url(`${dir}/person`, "#non-empty-string"),
                data: schemaJSON.$defs.address.properties.city,
                locationInFile: {
                  tokens: ["$defs", "address", "properties", "city"],
                  path: "/$defs/address/properties/city",
                  hash: "#/$defs/address/properties/city",
                },
              },
              {
                value: "person#/$defs/nonEmptyString",
                targetURI: path.url(`${dir}/person`, "#/$defs/nonEmptyString"),
                data: schemaJSON.$defs.address.properties.state,
                locationInFile: {
                  tokens: ["$defs", "address", "properties", "state"],
                  path: "/$defs/address/properties/state",
                  hash: "#/$defs/address/properties/state",
                },
              },
              {
                value: "person#/$defs/nonEmptyString",
                targetURI: path.url(`${dir}/person`, "#/$defs/nonEmptyString"),
                data: schemaJSON.$defs.address.properties.postalCode,
                locationInFile: {
                  tokens: ["$defs", "address", "properties", "postalCode"],
                  path: "/$defs/address/properties/postalCode",
                  hash: "#/$defs/address/properties/postalCode",
                },
              },
            ],
          },
        ]
      }],
    });
  }

});
