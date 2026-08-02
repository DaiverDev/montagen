import { describe, expect, it } from "vitest";
import { linear, easeIn, easeOut, easeInOut } from "../easing";

describe("linear", () => {
  it("returns identity (t = t)", () => {
    expect(linear(0)).toBe(0);
    expect(linear(0.25)).toBe(0.25);
    expect(linear(0.5)).toBe(0.5);
    expect(linear(0.75)).toBe(0.75);
    expect(linear(1)).toBe(1);
  });

  it("handles values outside 0..1 (passes through)", () => {
    expect(linear(-0.5)).toBe(-0.5);
    expect(linear(1.5)).toBe(1.5);
  });
});

describe("easeIn", () => {
  it("starts slow (cubic acceleration)", () => {
    // easeIn(0.5) = 0.5³ = 0.125
    expect(easeIn(0.5)).toBeCloseTo(0.125);
    expect(easeIn(0.5)).toBeLessThan(0.5);
  });

  it("returns 0 at t=0", () => {
    expect(easeIn(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(easeIn(1)).toBe(1);
  });

  it("is monotonic", () => {
    expect(easeIn(0.3)).toBeLessThan(easeIn(0.7));
  });
});

describe("easeOut", () => {
  it("ends slow (cubic deceleration)", () => {
    // easeOut(0.5) = 1 - (1-0.5)³ = 1 - 0.125 = 0.875
    expect(easeOut(0.5)).toBeCloseTo(0.875);
    expect(easeOut(0.5)).toBeGreaterThan(0.5);
  });

  it("returns 0 at t=0", () => {
    expect(easeOut(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(easeOut(1)).toBe(1);
  });

  it("is monotonic", () => {
    expect(easeOut(0.3)).toBeLessThan(easeOut(0.7));
  });
});

describe("easeInOut", () => {
  it("is symmetric at midpoint", () => {
    expect(easeInOut(0.5)).toBe(0.5);
  });

  it("returns 0 at t=0", () => {
    expect(easeInOut(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(easeInOut(1)).toBe(1);
  });

  it("accelerates in first half, decelerates in second", () => {
    // At 0.25: t < 0.5, so 4t³ = 4 * 0.015625 = 0.0625
    expect(easeInOut(0.25)).toBeCloseTo(0.0625);
    // At 0.75: t >= 0.5, so 1 - (-2t+2)³ / 2
    // -2*0.75+2 = 0.5, 0.5³ = 0.125, 0.125/2 = 0.0625, 1-0.0625 = 0.9375
    expect(easeInOut(0.75)).toBeCloseTo(0.9375);
  });

  it("is monotonic", () => {
    expect(easeInOut(0.3)).toBeLessThan(easeInOut(0.7));
  });
});
