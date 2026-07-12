// Shared sky-motion constants. Every constellation computes its position from
// the same clock + speed, so the whole field moves right-to-left in formation
// and wraps around, like a sky slowly passing overhead.

// horizontal speed, in viewport-% per second
export const SCROLL_SPEED = 0.35;

// constellations wrap within [WRAP_MIN, WRAP_MIN + WRAP_SPAN) so they fully
// clear the left edge before reappearing on the right (widest cluster ≈ 40vmin)
export const WRAP_MIN = -45;
export const WRAP_SPAN = 145;

export function wrapX(x) {
  return ((((x - WRAP_MIN) % WRAP_SPAN) + WRAP_SPAN) % WRAP_SPAN) + WRAP_MIN;
}
