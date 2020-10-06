"use strict";

const { readJsonSchema } = require("../../../");
const path = require("../../utils/path");
const assert = require("../../utils/assert");
const schemaJSON = require("./schema.json");
const personJSON = require("./person.json");
const addressJSON = require("./address.json");

const dir = "test/specs/multi-file";

describe("Multi-file schema with cross-references", () => {

  it("relative path", async () => {
    let schema = await readJsonSchema(path.rel(`${dir}/schema.json`));
    assertSchema(schema,
      path.rel(`${dir}/schema.json`),
      path.rel(`${dir}/person.json`),
      path.rel(`${dir}/address.json`),
    );
  });

  it("absolute path", async () => {
    let schema = await readJsonSchema(path.abs(`${dir}/schema.json`));
    assertSchema(schema,
      path.abs(`${dir}/schema.json`),
      path.abs(`${dir}/person.json`),
      path.abs(`${dir}/address.json`),
    );
  });

  it("URL", async () => {
    let schema = await readJsonSchema(path.url(`${dir}/schema.json`));
    assertSchema(schema,
      path.url(`${dir}/schema.json`).href,
      path.url(`${dir}/person.json`).href,
      path.url(`${dir}/address.json`).href,
    );
  });

  function assertSchema (schema, rootFilePath, personPath, addressPath) {
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
                  value: "person.json",
                  targetURI: path.url(`${dir}/person.json`),
                  data: schemaJSON.$defs.person,
                  locationInFile: {
                    tokens: ["$defs", "person"],
                    path: "/$defs/person",
                    hash: "#/$defs/person",
                  },
                },
                {
                  value: "person.json#name",
                  targetURI: path.url(`${dir}/person.json`, "#name"),
                  data: schemaJSON.$defs.name,
                  locationInFile: {
                    tokens: ["$defs", "name"],
                    path: "/$defs/name",
                    hash: "#/$defs/name",
                  },
                },
                {
                  value: "address.json",
                  targetURI: path.url(`${dir}/address.json`),
                  data: schemaJSON.$defs.address,
                  locationInFile: {
                    tokens: ["$defs", "address"],
                    path: "/$defs/address",
                    hash: "#/$defs/address",
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
          ]
        },
        {
          url: path.url(`${dir}/person.json`),
          path: personPath,
          mediaType: "application/json",
          resources: [
            {
              uri: path.url(`${dir}/person`),
              data: personJSON,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
              anchors: [
                {
                  name: "name",
                  uri: path.url(`${dir}/person`, "#name"),
                  data: personJSON.properties.name,
                  locationInFile: {
                    tokens: ["properties", "name"],
                    path: "/properties/name",
                    hash: "#/properties/name",
                  }
                }
              ],
              references: [
                {
                  value: "non-empty-string",
                  targetURI: path.url(`${dir}/non-empty-string`),
                  data: personJSON.properties.name.properties.first,
                  locationInFile: {
                    tokens: ["properties", "name", "properties", "first"],
                    path: "/properties/name/properties/first",
                    hash: "#/properties/name/properties/first",
                  },
                },
                {
                  value: "schema.json#non-empty-string",
                  targetURI: path.url(`${dir}/schema.json`, "#non-empty-string"),
                  data: personJSON.properties.name.properties.middle,
                  locationInFile: {
                    tokens: ["properties", "name", "properties", "middle"],
                    path: "/properties/name/properties/middle",
                    hash: "#/properties/name/properties/middle",
                  },
                },
                {
                  value: "schema.json#/$defs/nonEmptyString",
                  targetURI: path.url(`${dir}/schema.json`, "#/$defs/nonEmptyString"),
                  data: personJSON.properties.name.properties.last,
                  locationInFile: {
                    tokens: ["properties", "name", "properties", "last"],
                    path: "/properties/name/properties/last",
                    hash: "#/properties/name/properties/last",
                  },
                },
                {
                  value: "address.json",
                  targetURI: path.url(`${dir}/address.json`),
                  data: personJSON.properties.homeAddress,
                  locationInFile: {
                    tokens: ["properties", "homeAddress"],
                    path: "/properties/homeAddress",
                    hash: "#/properties/homeAddress",
                  },
                },
                {
                  value: "address.json#address",
                  targetURI: path.url(`${dir}/address.json`, "#address"),
                  data: personJSON.properties.workAddress,
                  locationInFile: {
                    tokens: ["properties", "workAddress"],
                    path: "/properties/workAddress",
                    hash: "#/properties/workAddress",
                  },
                },
                {
                  value: "foo/bar/../../address.json",
                  targetURI: path.url(`${dir}/address.json`),
                  data: personJSON.properties.schoolAddress,
                  locationInFile: {
                    tokens: ["properties", "schoolAddress"],
                    path: "/properties/schoolAddress",
                    hash: "#/properties/schoolAddress",
                  },
                },
              ],
            },
          ],
        },
        {
          url: path.url(`${dir}/address.json`),
          path: addressPath,
          mediaType: "application/json",
          resources: [
            {
              uri: path.url(`${dir}/address`),
              data: addressJSON,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
              anchors: [
                {
                  name: "address",
                  uri: path.url(`${dir}/address`, "#address"),
                  data: addressJSON,
                  locationInFile: {
                    tokens: [],
                    path: "",
                    hash: "#",
                  }
                }
              ],
              references: [
                {
                  value: "non-empty-string",
                  targetURI: path.url(`${dir}/non-empty-string`),
                  data: addressJSON.properties.street.items,
                  locationInFile: {
                    tokens: ["properties", "street", "items"],
                    path: "/properties/street/items",
                    hash: "#/properties/street/items",
                  },
                },
                {
                  value: "schema.json#non-empty-string",
                  targetURI: path.url(`${dir}/schema.json`, "#non-empty-string"),
                  data: addressJSON.properties.city,
                  locationInFile: {
                    tokens: ["properties", "city"],
                    path: "/properties/city",
                    hash: "#/properties/city",
                  },
                },
                {
                  value: "schema.json#/$defs/nonEmptyString",
                  targetURI: path.url(`${dir}/schema.json`, "#/$defs/nonEmptyString"),
                  data: addressJSON.properties.state,
                  locationInFile: {
                    tokens: ["properties", "state"],
                    path: "/properties/state",
                    hash: "#/properties/state",
                  },
                },
                {
                  value: "../../specs/multi-file/schema.json#non-empty-string",
                  targetURI: path.url(`${dir}/schema.json`, "#non-empty-string"),
                  data: addressJSON.properties.postalCode,
                  locationInFile: {
                    tokens: ["properties", "postalCode"],
                    path: "/properties/postalCode",
                    hash: "#/properties/postalCode",
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
