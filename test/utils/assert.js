"use strict";

const chai = require("chai");
const { expect } = require("chai");
const { JsonSchema, File, Resource, Anchor, Reference, Pointer, Resolution } = require("../../");

const assert = module.exports = Object.assign(chai.assert, {
  failed () {
    throw new Error("Expected the test to throw an error, but no error was thrown.");
  },

  schema (actual, expected, p = "schema.") {
    expect(actual).to.be.an.instanceOf(JsonSchema, `${p} (actual)`);
    expect(expected).to.be.an("object", `${p} (expected)`);
    expect(actual.hasErrors).to.equal(expected.hasErrors || false, `${p}hasErrors`);
    expect(actual.rootFile).to.equal(actual.files[0], `${p}rootFile`);
    expect(paths(actual.files)).to.have.same.members(paths(expected.files), `${p}files`);

    for (let [index, expectedFile] of entries(expected.files)) {
      let actualFile = actual.files[index];
      expect(actualFile.schema).to.equal(actual, `${p}files[${index}].schema`);
      assert.file(actualFile, expectedFile, `${p}files[${index}].`);
    }
  },

  file (actual, expected, p = "file.") {
    expect(actual).to.be.an.instanceOf(File, `${p} (actual)`);
    expect(expected).to.be.an("object", `${p} (expected)`);
    expect(actual.schema).to.be.an.instanceOf(JsonSchema, `${p}schema`);
    expect(href(actual)).to.equal(href(expected), `${p}url`);
    expect(actual.path).to.equal(expected.path, `${p}path`);

    if ("mediaType" in expected) {
      expect(actual.mediaType).to.equal(expected.mediaType, `${p}mediaType`);
    }

    if (expected.metadata) {
      expect(actual.metadata).to.deep.equal(expected.metadata, `${p}metadata`);
    }
    else {
      expect(actual.metadata).to.be.an("object", `${p}metadata`);
    }

    expect(actual.rootResource).to.equal(actual.resources[0], `${p}rootResource`);
    expect(uris(actual.resources)).to.have.same.members(uris(expected.resources), `${p}resources`);

    for (let [index, expectedResource] of entries(expected.resources)) {
      let actualResource = actual.resources[index];
      expect(actualResource.file).to.equal(actual, `${p}resources[${index}].file`);
      expect(actualResource.schema).to.equal(actual.schema, `${p}resources[${index}].schema`);
      assert.resource(actualResource, expectedResource, `${p}resources[${index}].`);
    }

    expect(codes(actual.errors)).to.have.same.members(codes(expected.errors), `${p}errors`);

    for (let [index, expectedError] of entries(expected.errors)) {
      let actualError = actual.errors[index];
      expect(actualError.file).to.equal(actual, `${p}errors[${index}].file`);
      expect(actualError.schema).to.equal(actual.schema, `${p}errors[${index}].schema`);
      assert.error(actualError, expectedError, `${p}errors[${index}].`);
    }
  },

  error (actual, expected, p = "error.") {
    expect(actual).to.be.an.instanceOf(Error, `${p} (actual)`);
    expect(expected).to.be.an("object", `${p} (expected)`);

    if (actual.schema !== undefined) {
      expect(actual.schema).to.be.an.instanceOf(JsonSchema, `${p}schema`);
    }

    if (actual.file !== undefined) {
      expect(actual.file).to.be.an.instanceOf(File, `${p}file`);
    }

    if (expected.message instanceof RegExp) {
      expect(actual.message).to.match(expected.message, `${p}message`);
    }
    else {
      expect(actual.message).to.equal(expected.message, `${p}message`);
    }

    expect(actual.name).to.equal(expected.name, `${p}name`);
    expect(actual.code).to.equal(expected.code, `${p}code`);

    if ("locationInFile" in expected) {
      assert.pointer(actual.locationInFile, expected.locationInFile, `${p}locationInFile.`);
    }

    if (actual.originalError || expected.originalError) {
      assert.error(actual.originalError, expected.originalError, `${p}originalError.`);
    }

    if (actual.errors || expected.errors) {
      expect(codes(actual.errors)).to.have.same.members(codes(expected.errors), `${p}errors`);

      for (let [index, expectedError] of entries(expected.errors)) {
        let actualError = actual.errors[index];
        expect(actualError.schema).to.equal(actual.schema, `${p}errors[${index}].schema`);
        assert.error(actualError, expectedError, `${p}errors[${index}].`);
      }
    }

    let keys = new Set(Object.keys(actual).concat(Object.keys(expected)));
    keys.delete("message");
    keys.delete("file");
    keys.delete("schema");
    keys.delete("locationInFile");
    keys.delete("originalError");
    keys.delete("errors");

    for (let key of keys) {
      expect(actual[key]).to.deep.equal(expected[key], `${p}${key}`);
    }
  },

  resource (actual, expected, p = "resource.") {
    expect(actual).to.be.an.instanceOf(Resource, `${p} (actual)`);
    expect(expected).to.be.an("object", `${p} (expected)`);
    expect(actual.schema).to.be.an.instanceOf(JsonSchema, `${p}schema`);
    expect(actual.file).to.be.an.instanceOf(File, `${p}file`);
    expect(actual.locationInFile).to.be.an.instanceOf(Pointer, `${p}locationInFile`);

    expect(href(actual.uri)).to.equal(href(expected.uri), `${p}uri`);
    expect(actual.data).to.deep.equal(expected.data, `${p}data`);
    assert.pointer(actual.locationInFile, expected.locationInFile, `${p}locationInFile.`);

    expect(names(actual.anchors)).to.have.same.members(names(expected.anchors), `${p}anchors`);

    for (let [index, expectedAnchor] of entries(expected.anchors)) {
      let actualAnchor = actual.anchors[index];
      expect(actualAnchor.resource).to.equal(actual, `${p}anchors[${index}].resource`);
      expect(actualAnchor.schema).to.equal(actual.schema, `${p}anchors[${index}].schema`);
      expect(actualAnchor.file).to.equal(actual.file, `${p}anchors[${index}].file`);
      assert.anchor(actualAnchor, expectedAnchor, `${p}anchors[${index}].`);
    }

    expect(values(actual.references)).to.have.same.members(values(expected.references), `${p}references`);

    for (let [index, expectedReference] of entries(expected.references)) {
      let actualReference = actual.references[index];
      expect(actualReference.resource).to.equal(actual, `${p}references[${index}].resource`);
      expect(actualReference.schema).to.equal(actual.schema, `${p}references[${index}].schema`);
      expect(actualReference.file).to.equal(actual.file, `${p}references[${index}].file`);
      assert.reference(actualReference, expectedReference, `${p}references[${index}].`);
    }
  },

  anchor (actual, expected, p = "anchor.") {
    expect(actual).to.be.an.instanceOf(Anchor, `${p} (actual)`);
    expect(expected).to.be.an("object", `${p} (expected)`);
    expect(actual.schema).to.be.an.instanceOf(JsonSchema, `${p}schema`);
    expect(actual.file).to.be.an.instanceOf(File, `${p}file`);
    expect(actual.resource).to.be.an.instanceOf(Resource, `${p}resource`);
    expect(actual.locationInFile).to.be.an.instanceOf(Pointer, `${p}locationInFile`);

    expect(actual.name).to.equal(expected.name, `${p}name`);
    expect(href(actual)).to.equal(href(expected), `${p}uri`);
    expect(actual.data).to.be.an("object", `${p}data`).and.deep.equal(expected.data, `${p}data`);
    assert.pointer(actual.locationInFile, expected.locationInFile, `${p}locationInFile.`);
  },

  reference (actual, expected, p = "reference.") {
    expect(actual).to.be.an.instanceOf(Reference, `${p} (actual)`);
    expect(expected).to.be.an("object", `${p} (expected)`);
    expect(actual.schema).to.be.an.instanceOf(JsonSchema, `${p}schema`);
    expect(actual.file).to.be.an.instanceOf(File, `${p}file`);
    expect(actual.resource).to.be.an.instanceOf(Resource, `${p}resource`);
    expect(actual.locationInFile).to.be.an.instanceOf(Pointer, `${p}locationInFile`);

    if ("file" in expected) {
      expect(href(actual.file)).to.equal(href(expected.file), `${p}file`);
    }

    if ("resource" in expected) {
      expect(href(actual.resource)).to.equal(href(expected.resource), `${p}resource`);
    }

    expect(actual.value).to.equal(expected.value, `${p}value`);
    expect(href(actual.targetURI)).to.equal(href(expected.targetURI), `${p}targetURI`);
    expect(actual.data).to.be.an("object", `${p}data`).and.deep.equal(expected.data, `${p}data`);
    assert.pointer(actual.locationInFile, expected.locationInFile, `${p}locationInFile.`);
  },

  pointer (actual, expected, p = "pointer.") {
    expect(actual).to.be.an.instanceOf(Pointer, `${p} (actual)`);
    expect(expected).to.be.an("object", `${p} (expected)`);
    expect(actual.tokens).to.deep.equal(expected.tokens, `${p}tokens`);
    expect(actual.path).to.equal(expected.path, `${p}path`);
    expect(actual.hash).to.equal(expected.hash, `${p}hash`);
  },

  resolution (actual, expected, p = "resolution.") {
    expect(actual).to.be.an.instanceOf(Resolution, `${p} (actual)`);
    expect(expected).to.be.an("object", `${p} (expected)`);
    expect(actual.schema).to.be.an.instanceOf(JsonSchema, `${p}schema`);
    expect(actual.file).to.be.an.instanceOf(File, `${p}file`);
    expect(actual.resource).to.be.an.instanceOf(Resource, `${p}resource`);
    expect(actual.locationInFile).to.be.an.instanceOf(Pointer, `${p}locationInFile`);

    expect(href(actual.file)).to.equal(href(expected.file), `${p}file`);
    expect(href(actual.resource)).to.equal(href(expected.resource), `${p}resource`);
    expect(href(actual)).to.equal(href(expected), `${p}uri`);
    expect(actual.data).to.deep.equal(expected.data, `${p}data`);
    assert.pointer(actual.locationInFile, expected.locationInFile, `${p}locationInFile.`);

    if (actual.reference || expected.reference) {
      expect(expected.reference).to.be.an("object", `${p}reference`);
      expect(expected.reference.file).to.be.an.instanceOf(File, `${p}reference.file`);
      expect(expected.reference.resource).to.be.an.instanceOf(Resource, `${p}reference.resource`);
      assert.reference(actual.reference, expected.reference, `${p}reference.`);
    }
    else {
      expect(actual.reference).to.equal(undefined);
    }

    if (actual.previousStep || expected.previousStep) {
      expect(actual.previousStep.schema).to.equal(actual.schema, `${p}previousStep.schema`);
      assert.resolution(actual.previousStep, expected.previousStep, `${p}previousStep.`);

      let steps = actual.steps;
      expect(steps).to.be.an("array", `${p}steps`).with.length.of.at.least(2, `${p}steps.length`);
      expect(steps[0]).to.equal(actual.firstStep, `${p}firstStep`);
      expect(steps[steps.length - 1]).to.equal(actual, `${p}steps[${steps.length - 1}]`);
    }
    else {
      expect(actual.previousStep).to.equal(undefined);

      let steps = actual.steps;
      expect(steps).to.be.an("array", `${p}steps`).with.lengthOf(1, `${p}steps.length`);
      expect(steps[0]).to.equal(actual, `${p}steps[0]`);
      expect(actual.firstStep).to.equal(actual, `${p}firstStep`);
    }
  },
});

function entries (array = []) {
  return array.entries();
}

function paths (files = []) {
  return files.map(file => file.path);
}

function uris (resources = []) {
  return resources.map(resource => href(resource));
}

function codes (errors = []) {
  return errors.map(error => error.code);
}

function values (refs = []) {
  return refs.map(ref => ref.value);
}

function names (anchors = []) {
  return anchors.map(anchor => anchor.name);
}

function href (obj = {}) {
  let url = obj.url || obj.uri || obj;
  return (url && url.href) ? url.href : "";
}
