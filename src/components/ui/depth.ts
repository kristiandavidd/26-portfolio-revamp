import { useTransform, type MotionValue } from "framer-motion";

/**
 * One depth ladder, shared by every section, so the 2.5D reads as a single
 * world instead of five unrelated effects. Each value multiplies a layer's
 * travel through the viewport: layers furthest back barely move, layers at the
 * front run ahead of the scroll and read as closest to the glass.
 *
 * The gaps matter more than the absolute numbers. A layer at 0.5 against one at
 * 0.8 separates by 60% of its own travel, which is what the eye reads as depth.
 */
export const DEPTH = {
  /** Atmosphere: oversized background type, glow, set dressing. */
  atmosphere: 0.25,
  /** Backdrop: framing marks, ghost numerals, rules. */
  backdrop: 0.5,
  /** Subject: the thing the section is actually about. */
  subject: 0.8,
  /** Foreground: accents that cross the subject as you scroll. */
  foreground: 1.15,
} as const;

export type Depth = keyof typeof DEPTH;

// Smoothstep stops. A linear ramp leaves layers still moving when a section
// releases, and because neighbouring layers run in opposite directions that
// reversal lands in a single frame and reads as a jolt. Easing both ends means
// every layer arrives and leaves at rest.
export const EASE_STOPS = [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1];
const SMOOTH = [0, 0.061, 0.216, 0.5, 0.784, 0.939, 1];

/** Maps a 0..1 range onto eased 0..1 stops, for use as `useTransform` output. */
export function easedRange(from: number, to: number) {
  return SMOOTH.map((t) => from + (to - from) * t);
}

/**
 * Vertical drift for a layer at the given depth. `travel` is the distance a
 * subject-depth layer covers across the whole tracked range; every other depth
 * derives from it, so callers only ever pass one number per section.
 *
 * Must be called at the top level of a component — one component per item when
 * rendering a list, since hooks cannot run inside a map callback.
 */
export function useDepthY(
  progress: MotionValue<number>,
  depth: Depth,
  travel: number,
) {
  const t = travel * DEPTH[depth];
  return useTransform(progress, EASE_STOPS, easedRange(t, -t));
}

/** Horizontal drift, for layers that slide against the page rather than down it. */
export function useDepthX(
  progress: MotionValue<number>,
  depth: Depth,
  travel: number,
) {
  const t = travel * DEPTH[depth];
  return useTransform(progress, EASE_STOPS, easedRange(t, -t));
}
