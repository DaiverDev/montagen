export type EasingFn = (t: number) => number;

export const linear: EasingFn = (t) => t;

export const easeIn: EasingFn = (t) => t * t * t;

export const easeOut: EasingFn = (t) => 1 - (1 - t) * (1 - t) * (1 - t);

export const easeInOut: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) * (-2 * t + 2) * (-2 * t + 2)) / 2;
