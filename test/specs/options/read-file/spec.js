"use strict";

const { readJsonSchema } = require("../../../../");
const path = require("../../../utils/path");
const assert = require("../../../utils/assert");
const schemaJSON = require("./schema.json");

const personJSON = {
  title: "Person",
  properties: {
    name: { type: "string" }
  },
};

const addressJSON = {
  title: "Address",
  properties: {
    city: { type: "string" }
  },
};

const dir = "test/specs/options/read-file";

describe("Options: readFile", () => {
  it("should augment the default implementation", async () => {
    let schema = await readJsonSchema(path.rel(`${dir}/schema.json`), {
      async readFile (file, helpers) {
        if (file.url.pathname.endsWith("person.json")) {
          file.data = personJSON;
        }
        else if (file.url.pathname.endsWith("address.json")) {
          file.data = addressJSON;
        }
        else {
          await helpers.readFile(file, helpers);
        }

        file.mediaType = "custom/json";
        file.metadata.foo = "bar";
      }
    });

    assert.schema(schema, {
      files: [
        {
          url: path.url(`${dir}/schema.json`),
          path: path.rel(`${dir}/schema.json`),
          mediaType: "custom/json",
          metadata: Object.assign({}, schema.rootFile.metadata, { foo: "bar" }),
          resources: [{
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
          }],
        },
        {
          url: path.url(`${dir}/person.json`),
          path: path.rel(`${dir}/person.json`),
          mediaType: "custom/json",
          metadata: { foo: "bar" },
          resources: [{
            uri: path.url(`${dir}/person.json`),
            data: personJSON,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          }],
        },
        {
          url: path.url(`${dir}/address.json`),
          path: path.rel(`${dir}/address.json`),
          mediaType: "custom/json",
          metadata: { foo: "bar" },
          resources: [{
            uri: path.url(`${dir}/address.json`),
            data: addressJSON,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          }],
        },
      ],
    });
  });

  it("should replace the default implementation", async () => {
    let schema = await readJsonSchema(path.rel(`${dir}/schema.json`), {
      readFile (file) {
        file.mediaType = "custom/json";
        file.metadata.foo = "bar";
        file.data = { fizz: "buzz" };
      }
    });

    assert.schema(schema, {
      files: [
        {
          url: path.url(`${dir}/schema.json`),
          path: path.rel(`${dir}/schema.json`),
          mediaType: "custom/json",
          metadata: { foo: "bar" },
          resources: [{
            uri: path.url(`${dir}/schema.json`),
            data: { fizz: "buzz" },
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          }],
        },
      ],
    });
  });

  it("should handle a thrown error", async () => {
    try {
      await readJsonSchema(path.rel(`${dir}/schema.json`), {
        readFile () {
          throw new RangeError("BOOM");
        }
      });
    }
    catch (error) {
      let errorPOJO = {
        name: "SchemaError",
        code: "ERR_READ",
        message:
          `Unable to read ${path.rel(`${dir}/schema.json`)}\n` +
          "  BOOM",
        originalError: {
          name: "RangeError",
          message: "BOOM",
        }
      };

      assert.error(error, errorPOJO);
      assert.schema(error.schema, {
        hasErrors: true,
        files: [
          {
            url: path.url(`${dir}/schema.json`),
            path: path.rel(`${dir}/schema.json`),
            mediaType: "application/schema+json",
            metadata: {},
            errors: [errorPOJO],
            resources: [{
              uri: path.url(`${dir}/schema.json`),
              data: undefined,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
            }],
          },
        ],
      });
    }
  });

  it("should re-throw the first error by default", async () => {
    try {
      await readJsonSchema(path.rel(`${dir}/schema.json`), {
        readFile (file, helpers) {
          helpers.handleError(new RangeError("BOOM 1"));
          helpers.handleError(new RangeError("BOOM 2"));
          helpers.handleError(new RangeError("BOOM 3"));
        }
      });
    }
    catch (error) {
      let errorPOJO = {
        name: "SchemaError",
        code: "ERR_READ",
        message:
          `Unable to read ${path.rel(`${dir}/schema.json`)}\n` +
          "  BOOM 1",
        originalError: {
          name: "RangeError",
          message: "BOOM 1",
        }
      };

      assert.error(error, errorPOJO);
      assert.schema(error.schema, {
        hasErrors: true,
        files: [
          {
            url: path.url(`${dir}/schema.json`),
            path: path.rel(`${dir}/schema.json`),
            mediaType: "application/schema+json",
            metadata: {},
            errors: [errorPOJO],
            resources: [{
              uri: path.url(`${dir}/schema.json`),
              data: undefined,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
            }],
          },
        ],
      });
    }
  });

  it("should handle multiple errors when continueOnError is enabled", async () => {
    try {
      await readJsonSchema(path.rel(`${dir}/schema.json`), {
        continueOnError: true,
        readFile (file, helpers) {
          helpers.handleError(new RangeError("BOOM 1"));
          helpers.handleError(new RangeError("BOOM 2"));
          helpers.handleError(new RangeError("BOOM 3"));
        }
      });
    }
    catch (error) {
      const makeErrorPOJO = (msg) => ({
        name: "SchemaError",
        code: "ERR_READ",
        message: `Unable to read ${path.rel(`${dir}/schema.json`)}\n  ${msg}`,
        originalError: {
          name: "RangeError",
          message: msg,
        }
      });

      let error1 = makeErrorPOJO("BOOM 1");
      let error2 = makeErrorPOJO("BOOM 2");
      let error3 = makeErrorPOJO("BOOM 3");

      assert.error(error, {
        name: "MultiError",
        code: "ERR_MULTIPLE",
        message: `3 errors occurred while reading ${path.rel(`${dir}/schema.json`)}`,
        errors: [error1, error2, error3]
      });
      assert.schema(error.schema, {
        hasErrors: true,
        files: [
          {
            url: path.url(`${dir}/schema.json`),
            path: path.rel(`${dir}/schema.json`),
            mediaType: "application/schema+json",
            metadata: {},
            errors: [error1, error2, error3],
            resources: [{
              uri: path.url(`${dir}/schema.json`),
              data: undefined,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
            }],
          },
        ],
      });
    }
  });
});
