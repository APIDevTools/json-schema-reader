"use strict";

const { readJsonSchema } = require("../../../../");
const { host } = require("@jsdevtools/host-environment");
const path = require("../../../utils/path");
const assert = require("../../../utils/assert");
const schemaJSON = require("./schema.json");
const personJSON = require("./person.json");

const dir = "test/specs/options/continue-on-error";

describe("Options: continueOnError", () => {

  it("relative path", async () => {
    try {
      await readJsonSchema(path.rel(`${dir}/schema.json`), { continueOnError: true });
      assert.failed();
    }
    catch (error) {
      assertError(error,
        path.rel(`${dir}/schema.json`),
        path.rel(`${dir}/person.json`),
        path.rel(`${dir}/age.json`),
        path.rel(`${dir}/address.json`),
        path.rel(`${dir}/company.xyz`),
        path.rel(`${dir}/invalid/path/address.json`),
      );
    }
  });

  it("absolute path", async () => {
    try {
      await readJsonSchema(path.abs(`${dir}/schema.json`), { continueOnError: true });
      assert.failed();
    }
    catch (error) {
      assertError(error,
        path.abs(`${dir}/schema.json`),
        path.abs(`${dir}/person.json`),
        path.abs(`${dir}/age.json`),
        path.abs(`${dir}/address.json`),
        path.abs(`${dir}/company.xyz`),
        path.abs(`${dir}/invalid/path/address.json`),
      );
    }
  });

  it("URL", async () => {
    try {
      await readJsonSchema(path.url(`${dir}/schema.json`), { continueOnError: true });
      assert.failed();
    }
    catch (error) {
      assertError(error,
        path.url(`${dir}/schema.json`).href,
        path.url(`${dir}/person.json`).href,
        path.url(`${dir}/age.json`).href,
        path.url(`${dir}/address.json`).href,
        path.url(`${dir}/company.xyz`).href,
        path.url(`${dir}/invalid/path/address.json`).href,
      );
    }
  });

  function assertError (error, rootFilePath, personPath, agePath, addressPath, companyPath, invalidPath) {
    let error1 = {
      name: "SchemaError",
      code: "ERR_INDEX",
      input: "Non Empty String",
      message:
        `Error in ${rootFilePath} at /$defs/nonEmptyString/$anchor\n` +
        "  $anchor contains illegal characters.",
      originalError: {
        name: "SyntaxError",
        code: "ERR_INVALID_ANCHOR",
        message: "$anchor contains illegal characters.",
        input: "Non Empty String",
      },
    };
    let error2 = {
      name: "SchemaError",
      code: "ERR_INDEX",
      input: "#person",
      message:
        `Error in ${personPath} at /$id\n` +
        "  $id cannot include a fragment: #person",
      originalError: {
        name: "URIError",
        code: "ERR_INVALID_URL",
        message: "$id cannot include a fragment: #person",
        input: "#person",
      },
    };
    let error3 = {
      name: "SchemaError",
      code: "ERR_INDEX",
      input: "#name",
      message:
        `Error in ${personPath} at /properties/name/$anchor\n` +
        "  $anchor cannot start with a \"#\" character.",
      originalError: {
        name: "SyntaxError",
        code: "ERR_INVALID_ANCHOR",
        message: "$anchor cannot start with a \"#\" character.",
        input: "#name",
      },
    };
    let error4 = {
      name: "SchemaError",
      code: "ERR_READ",
      errno: host.browser ? undefined : -4058,
      syscall: host.browser ? undefined : "stat",
      path: host.browser ? undefined : path.abs(`${dir}/age.json`),
      message: /^Unable to read .*age\.json\n  /,
      originalError: {
        name: host.browser ? "URIError" : "Error",
        code: host.browser ? undefined : "ENOENT",
        message: /age\.json/,
        errno: host.browser ? undefined : -4058,
        syscall: host.browser ? undefined : "stat",
        path: host.browser ? undefined : path.abs(`${dir}/age.json`),
      },
    };
    let error5 = {
      name: "SchemaError",
      code: "ERR_PARSE",
      message: /^Unable to parse .*address\.json\n  /,
      originalError: {
        name: "SyntaxError",
        message: /Invalid|expected/,
      },
    };
    let error6 = {
      name: "SchemaError",
      code: "ERR_READ",
      errno: host.browser ? undefined : -4058,
      syscall: host.browser ? undefined : "stat",
      path: host.browser ? undefined : path.abs(`${dir}/invalid/path/address.json`),
      message: /^Unable to read .*address\.json\n  /,
      originalError: {
        name: host.browser ? "URIError" : "Error",
        code: host.browser ? undefined : "ENOENT",
        message: /address\.json/,
        errno: host.browser ? undefined : -4058,
        syscall: host.browser ? undefined : "stat",
        path: host.browser ? undefined : path.abs(`${dir}/invalid/path/address.json`),
      },
    };

    assert.error(error, {
      name: "MultiError",
      code: "ERR_MULTIPLE",
      message: `6 errors occurred while reading ${rootFilePath}`,
      errors: [error1, error2, error3, error4, error5, error6]
    });

    assert.schema(error.schema, {
      hasErrors: true,
      files: [
        {
          url: path.url(`${dir}/schema.json`),
          path: rootFilePath,
          mediaType: "application/json",
          errors: [error1],
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
                  value: "age.json",
                  targetURI: path.url(`${dir}/age.json`),
                  data: schemaJSON.$defs.age,
                  locationInFile: {
                    tokens: ["$defs", "age"],
                    path: "/$defs/age",
                    hash: "#/$defs/age",
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
                {
                  value: "company.xyz",
                  targetURI: path.url(`${dir}/company.xyz`),
                  data: schemaJSON.$defs.company,
                  locationInFile: {
                    tokens: ["$defs", "company"],
                    path: "/$defs/company",
                    hash: "#/$defs/company",
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
            },
          ]
        },
        {
          url: path.url(`${dir}/person.json`),
          path: personPath,
          mediaType: "application/json",
          errors: [error2, error3],
          resources: [
            {
              uri: path.url(`${dir}/person.json`),
              data: personJSON,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
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
                  value: "#non-empty-string",
                  targetURI: path.url(`${dir}/person.json`, "#non-empty-string"),
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
                  value: "invalid/path/address.json",
                  targetURI: path.url(`${dir}/invalid/path/address.json`),
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
          url: path.url(`${dir}/age.json`),
          path: agePath,
          mediaType: "",
          errors: [error4],
          resources: [
            {
              uri: path.url(`${dir}/age.json`),
              data: undefined,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
            },
          ],
        },
        {
          url: path.url(`${dir}/address.json`),
          path: addressPath,
          mediaType: "application/json",
          errors: [error5],
          resources: [
            {
              uri: path.url(`${dir}/address.json`),
              data: "{ syntax: error }\n",
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
            },
          ],
        },
        {
          url: path.url(`${dir}/company.xyz`),
          path: companyPath,
          mediaType: "chemical/x-xyz",
          resources: [
            {
              uri: path.url(`${dir}/company.xyz`),
              data: new Uint8Array([
                84, 104, 105, 115, 32, 102, 105, 108, 101, 32, 104, 97, 115, 32, 97, 110,
                32, 117, 110, 107, 110, 111, 119, 110, 32, 102, 105, 108, 101, 32, 101,
                120, 116, 101, 110, 115, 105, 111, 110, 44, 32, 115, 111, 32, 105, 116, 32,
                119, 105, 108, 108, 32, 98, 101, 32, 114, 101, 97, 100, 32, 97, 115, 32, 98,
                105, 110, 97, 114, 121, 32, 100, 97, 116, 97, 10
              ]).buffer,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
            },
          ],
        },
        {
          url: path.url(`${dir}/invalid/path/address.json`),
          path: invalidPath,
          mediaType: "",
          errors: [error6],
          resources: [
            {
              uri: path.url(`${dir}/invalid/path/address.json`),
              data: undefined,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
            },
          ],
        },
      ],
    });
  }

});
