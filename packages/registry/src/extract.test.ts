import { describe, expect, it } from "vitest";
import { extractExportedNames, extractImportSpecifiers } from "./validate";

describe("extractImportSpecifiers", () => {
  it("extracts default, named, and type-only import specifiers", () => {
    const source = `
import Foo from "foo";
import { a, b } from "@/lib/mapcn/geo";
import type { X } from "./types";
import * as ns from "bar";
`;
    expect(extractImportSpecifiers(source).sort()).toEqual(["./types", "@/lib/mapcn/geo", "bar", "foo"].sort());
  });

  it("returns an empty array for a file with no imports", () => {
    expect(extractImportSpecifiers("export const x = 1;")).toEqual([]);
  });
});

describe("extractExportedNames", () => {
  it("extracts exported function and const declarations", () => {
    const source = `
export function Foo() {}
export const bar = 1;
function notExported() {}
`;
    expect(extractExportedNames(source)).toEqual(["Foo", "bar"]);
  });

  it("extracts names from export {} blocks, respecting 'as' renames", () => {
    const source = `export { Foo, Bar as Baz };`;
    expect(extractExportedNames(source)).toEqual(["Baz", "Foo"]);
  });

  it("extracts names from export type {} blocks", () => {
    const source = `export type { MapProps, MapInstance as Instance };`;
    expect(extractExportedNames(source)).toEqual(["Instance", "MapProps"]);
  });

  it("deduplicates names that appear via multiple export forms", () => {
    const source = `
export const Foo = 1;
export { Foo };
`;
    expect(extractExportedNames(source)).toEqual(["Foo"]);
  });
});
