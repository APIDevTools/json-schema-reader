"use strict";

const { readJsonSchema } = require("../../../../");
const path = require("../../../utils/path");
const assert = require("../../../utils/assert");
const schemaJSON = require("./schema.json");

const dir = "test/specs/options/parse-file";

describe("Options: parseFile", () => {
  it("should augment the default implementation", async () => {
    let schema = await readJsonSchema(path.rel(`${dir}/schema.json`), {
      parseFile (file, helpers) {
        file.metadata = {
          length: file.data.length,
        };
        helpers.parseFile(file, helpers);
      }
    });

    assert.schema(schema, {
      files: [{
        url: path.url(`${dir}/schema.json`),
        path: path.rel(`${dir}/schema.json`),
        mediaType: "application/json",
        resources: [{
          uri: path.url(`${dir}/person`),
          data: schemaJSON,
          locationInFile: {
            tokens: [],
            path: "",
            hash: "#",
          },
        }],
      }],
    });
  });

  it("should replace the default implementation", async () => {
    let schema = await readJsonSchema(path.rel(`${dir}/schema.json`), {
      parseFile (file) {
        file.data = { custom: "data" };
      }
    });

    assert.schema(schema, {
      files: [
        {
          url: path.url(`${dir}/schema.json`),
          path: path.rel(`${dir}/schema.json`),
          mediaType: "application/json",
          resources: [{
            uri: path.url(`${dir}/schema.json`),
            data: { custom: "data" },
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
        parseFile () {
          throw new RangeError("BOOM");
        }
      });
    }
    catch (error) {
      let errorPOJO = {
        name: "SchemaError",
        code: "ERR_PARSE",
        message:
          `Unable to parse ${path.rel(`${dir}/schema.json`)}\n` +
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
            mediaType: "application/json",
            errors: [errorPOJO],
            resources: [{
              uri: path.url(`${dir}/schema.json`),
              data: JSON.stringify(schemaJSON, null, 2) + "\n",
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
        parseFile (file, helpers) {
          helpers.handleError(new RangeError("BOOM 1"));
          helpers.handleError(new RangeError("BOOM 2"));
          helpers.handleError(new RangeError("BOOM 3"));
        }
      });
    }
    catch (error) {
      let errorPOJO = {
        name: "SchemaError",
        code: "ERR_PARSE",
        message:
          `Unable to parse ${path.rel(`${dir}/schema.json`)}\n` +
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
            mediaType: "application/json",
            errors: [errorPOJO],
            resources: [{
              uri: path.url(`${dir}/schema.json`),
              data: JSON.stringify(schemaJSON, null, 2) + "\n",
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
        parseFile (file, helpers) {
          helpers.handleError(new RangeError("BOOM 1"));
          helpers.handleError(new RangeError("BOOM 2"));
          helpers.handleError(new RangeError("BOOM 3"));
        }
      });
    }
    catch (error) {
      const makeErrorPOJO = (msg) => ({
        name: "SchemaError",
        code: "ERR_PARSE",
        message: `Unable to parse ${path.rel(`${dir}/schema.json`)}\n  ${msg}`,
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
            mediaType: "application/json",
            errors: [error1, error2, error3],
            resources: [{
              uri: path.url(`${dir}/schema.json`),
              data: JSON.stringify(schemaJSON, null, 2) + "\n",
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
