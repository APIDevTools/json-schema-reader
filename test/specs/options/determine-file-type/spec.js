"use strict";

const { readJsonSchema } = require("../../../../");
const path = require("../../../utils/path");
const assert = require("../../../utils/assert");
const schemaJSON = require("./schema.json");

const dir = "test/specs/options/determine-file-type";

describe("Options: determineFileType", () => {
  it("should augment the default implementation", async () => {
    let schema = await readJsonSchema(path.rel(`${dir}/schema.json`), {
      determineFileType (file, helpers) {
        file.mediaType = "text/json";
        return helpers.determineFileType(file, helpers);
      }
    });

    assert.schema(schema, {
      files: [{
        url: path.url(`${dir}/schema.json`),
        path: path.rel(`${dir}/schema.json`),
        mediaType: "text/json",
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
      determineFileType () {
        return "binary";
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
            data: new Uint8Array([
              123, 10, 32, 32, 34, 36, 105, 100, 34, 58, 32, 34, 112, 101, 114, 115, 111,
              110, 34, 44, 10, 32, 32, 34, 116, 105, 116, 108, 101, 34, 58, 32, 34, 80,
              101, 114, 115, 111, 110, 34, 44, 10, 32, 32, 34, 116, 121, 112, 101, 34, 58,
              32, 34, 111, 98, 106, 101, 99, 116, 34, 44, 10, 32, 32, 34, 114, 101, 113,
              117, 105, 114, 101, 100, 34, 58, 32, 91, 34, 110, 97, 109, 101, 34, 44, 32,
              34, 97, 103, 101, 34, 93, 44, 10, 32, 32, 34, 112, 114, 111, 112, 101, 114,
              116, 105, 101, 115, 34, 58, 32, 123, 10, 32, 32, 32, 32, 34, 110, 97, 109,
              101, 34, 58, 32, 123, 32, 34, 116, 121, 112, 101, 34, 58, 32, 34, 115, 116,
              114, 105, 110, 103, 34, 32, 125, 44, 10, 32, 32, 32, 32, 34, 97, 103, 101,
              34, 58, 32, 123, 10, 32, 32, 32, 32, 32, 32, 34, 116, 121, 112, 101, 34, 58,
              32, 34, 105, 110, 116, 101, 103, 101, 114, 34, 44, 10, 32, 32, 32, 32, 32,
              32, 34, 109, 105, 110, 105, 109, 117, 109, 34, 58, 32, 48, 44, 10, 32, 32,
              32, 32, 32, 32, 34, 100, 101, 115, 99, 114, 105, 112, 116, 105, 111, 110, 34,
              58, 32, 34, 84, 104, 101, 32, 112, 101, 114, 115, 111, 110, 39, 115, 32, 97,
              103, 101, 44, 32, 105, 110, 32, 119, 104, 111, 108, 101, 32, 121, 101, 97,
              114, 115, 34, 10, 32, 32, 32, 32, 125, 10, 32, 32, 125, 10, 125, 10
            ]).buffer,
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
        determineFileType () {
          throw new RangeError("BOOM");
        }
      });
    }
    catch (error) {
      let errorPOJO = {
        name: "SchemaError",
        code: "ERR_FILE_TYPE",
        message:
          `Unable to determine the file type of ${path.rel(`${dir}/schema.json`)}\n` +
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
        determineFileType (file, helpers) {
          helpers.handleError(new RangeError("BOOM 1"));
          helpers.handleError(new RangeError("BOOM 2"));
          helpers.handleError(new RangeError("BOOM 3"));
        }
      });
    }
    catch (error) {
      let errorPOJO = {
        name: "SchemaError",
        code: "ERR_FILE_TYPE",
        message:
          `Unable to determine the file type of ${path.rel(`${dir}/schema.json`)}\n` +
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
        determineFileType (file, helpers) {
          helpers.handleError(new RangeError("BOOM 1"));
          helpers.handleError(new RangeError("BOOM 2"));
          helpers.handleError(new RangeError("BOOM 3"));
        }
      });
    }
    catch (error) {
      const makeErrorPOJO = (msg) => ({
        name: "SchemaError",
        code: "ERR_FILE_TYPE",
        message: `Unable to determine the file type of ${path.rel(`${dir}/schema.json`)}\n  ${msg}`,
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
              data: new Uint8Array([
                123, 10, 32, 32, 34, 36, 105, 100, 34, 58, 32, 34, 112, 101, 114, 115, 111,
                110, 34, 44, 10, 32, 32, 34, 116, 105, 116, 108, 101, 34, 58, 32, 34, 80,
                101, 114, 115, 111, 110, 34, 44, 10, 32, 32, 34, 116, 121, 112, 101, 34, 58,
                32, 34, 111, 98, 106, 101, 99, 116, 34, 44, 10, 32, 32, 34, 114, 101, 113,
                117, 105, 114, 101, 100, 34, 58, 32, 91, 34, 110, 97, 109, 101, 34, 44, 32,
                34, 97, 103, 101, 34, 93, 44, 10, 32, 32, 34, 112, 114, 111, 112, 101, 114,
                116, 105, 101, 115, 34, 58, 32, 123, 10, 32, 32, 32, 32, 34, 110, 97, 109,
                101, 34, 58, 32, 123, 32, 34, 116, 121, 112, 101, 34, 58, 32, 34, 115, 116,
                114, 105, 110, 103, 34, 32, 125, 44, 10, 32, 32, 32, 32, 34, 97, 103, 101,
                34, 58, 32, 123, 10, 32, 32, 32, 32, 32, 32, 34, 116, 121, 112, 101, 34, 58,
                32, 34, 105, 110, 116, 101, 103, 101, 114, 34, 44, 10, 32, 32, 32, 32, 32,
                32, 34, 109, 105, 110, 105, 109, 117, 109, 34, 58, 32, 48, 44, 10, 32, 32,
                32, 32, 32, 32, 34, 100, 101, 115, 99, 114, 105, 112, 116, 105, 111, 110, 34,
                58, 32, 34, 84, 104, 101, 32, 112, 101, 114, 115, 111, 110, 39, 115, 32, 97,
                103, 101, 44, 32, 105, 110, 32, 119, 104, 111, 108, 101, 32, 121, 101, 97,
                114, 115, 34, 10, 32, 32, 32, 32, 125, 10, 32, 32, 125, 10, 125, 10
              ]).buffer,
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
