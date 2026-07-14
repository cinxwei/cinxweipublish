// Shared sky-motion constants. Every constellation computes its position from
// the same clock + speed, so the whole field moves in formation and wraps
// around, like a sky slowly passing overhead.

// horizontal speed, in ring-% per second
export const SCROLL_SPEED = 0.35;

// Constellation x values are phases on a ring of circumference WRAP_SPAN.
// The visible viewport covers [0, 100]; the buffer below 0 lets a shape fully
// clear the left edge before it re-enters on the right. Distribute entry
// phases across the whole ring (0..WRAP_SPAN) so the cycle has no gap.
export const WRAP_MIN = -45;
export const WRAP_SPAN = 145;

export function wrapX(x) {
  return ((((x - WRAP_MIN) % WRAP_SPAN) + WRAP_SPAN) % WRAP_SPAN) + WRAP_MIN;
}

// --- shared sky clock -------------------------------------------------
// Base drift plus a user-scrollable component: horizontal scrolling adds
// velocity that carries the sky forward (or briefly backward), then decays
// back to the ambient drift. All constellations read the same clock, so
// the formation stays rigid. Integration is guarded by timestamp: rAF
// callbacks within one frame share a timestamp, so it advances only once.
const FRICTION = 2.2; // per-second decay of scroll velocity

let extra = 0; // accumulated scroll distance, in ring-%
let vel = 0; // current scroll velocity, ring-%/s
let lastT = null;

export function skyPos(now) {
  if (lastT === null) lastT = now;
  if (now > lastT) {
    const dt = Math.min((now - lastT) / 1000, 0.1);
    extra += vel * dt;
    vel *= Math.max(0, 1 - FRICTION * dt);
    lastT = now;
  }
  return (now / 1000) * SCROLL_SPEED + extra;
}

export function nudgeSky(amount) {
  vel += amount;
}
