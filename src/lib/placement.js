import { WRAP_MIN, WRAP_SPAN } from "./sky.js";

// Find a spot on the sky ring for a new constellation that keeps clear of
// the boxes already there. Every constellation moves with the same sky
// clock, so relative positions are fixed and a placement chosen here stays
// clear forever. Rejection-samples random placements until one has enough
// clearance; if none does, keeps the least-crowded one seen.
const MARGIN = 2; // ring-% of breathing room between boxes
const ATTEMPTS = 80;

export function placeInField(takenFields, size, viewport) {
  const vmin = Math.min(viewport.w, viewport.h) / 100;
  const box = (f) => {
    const w = ((f.size * vmin) / viewport.w) * 100; // ring-%
    const h = ((f.size * vmin) / viewport.h) * 100; // % viewport height
    return { cx: f.x + w / 2, cy: f.y + h / 2, w, h };
  };
  const taken = takenFields.map(box);

  // gap between two boxes: positive when separated on at least one axis
  const gapTo = (b, t) => {
    let dx = Math.abs(b.cx - t.cx) % WRAP_SPAN;
    dx = Math.min(dx, WRAP_SPAN - dx);
    return Math.max(
      dx - (b.w + t.w) / 2,
      Math.abs(b.cy - t.cy) - (b.h + t.h) / 2
    );
  };

  let best = null;
  let bestGap = -Infinity;
  for (let i = 0; i < ATTEMPTS && bestGap < MARGIN; i++) {
    const f = {
      x: WRAP_MIN + Math.random() * WRAP_SPAN,
      y: 10 + Math.random() * 60,
      size,
    };
    const b = box(f);
    const gap = Math.min(...taken.map((t) => gapTo(b, t)), Infinity);
    if (gap > bestGap) {
      bestGap = gap;
      best = f;
    }
  }
  return best;
}
