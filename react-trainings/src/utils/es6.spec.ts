import { describe, it, expect } from "vitest";
import * as ES6 from "./es6";
import { data } from "../fake-data";

describe("es6", () => {
  it("test array lenght", () => {
    expect(ES6.getLength(data)).toEqual(4);
  });
  it("test male array lenght", () => {
    expect(ES6.getMales(data)).toEqual(2);
  });
  it("returns names", () => {
    expect(ES6.getNames(data)).toEqual([
      "Luke Skywalker",
      "C-3PO",
      "R2-D2",
      "Darth Vader",
    ]);
  });
  it("returns names", () => {
    expect(ES6.getAttr("name")(data)).toEqual([
      "Luke Skywalker",
      "C-3PO",
      "R2-D2",
      "Darth Vader",
    ]);
  });
  it("test first element contains name and id keys and not dummy", () => {
    expect(ES6.checkFirstElementKeys([])).toBeNull();
    const keys = ES6.checkFirstElementKeys(data);
    expect(keys).toContain("name");
    expect(keys).toContain("id");
    expect(keys).not.toContain("dummy");
  });
  it("build an array with `key: value` elements for last person and check `skin_color: white` is in", () => {
    expect(ES6.buildInfosForLastElement([])).toBeNull();
    expect(ES6.buildInfosForLastElement(data)).toContain("skin_color: white");
  });
  it("returns persons median", () => {
    expect(ES6.getMassAverage([])).toBe(null);
    expect(ES6.getMassAverage([...data, { name: "ko", id: "ko_id" }])).toBe(
      null,
    );
    expect(ES6.getMassAverage(data)).toBe(80);
  });
  it("returns partial last person with 1 added", () => {
    expect(Object.keys(ES6.addOneForLastElement([]))).toHaveLength(0);
    const result = ES6.addOneForLastElement(data);
    expect(Object.keys(result)).toHaveLength(2);
    expect(result.height).toBe("203");
    expect(result.mass).toBe("137");
  });
});
