// Recognizes a hand-drawn five-point star (pentagram) gesture: press, draw
// the usual bottom-left-start star in one stroke, release. The signature we
// look for is geometric rather than exact: a roughly closed stroke with
// several sharp corners whose segments cross themselves a few times — a
// pentagram self-intersects 5 times, which almost nothing drawn casually does.

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathLength(pts) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += dist(pts[i - 1], pts[i]);
  return len;
}

// resample the raw stroke to n evenly spaced points
function resample(pts, n) {
  const total = pathLength(pts);
  if (total === 0) return null;
  const step = total / (n - 1);
  const out = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    let prev = pts[i - 1];
    let d = dist(prev, pts[i]);
    while (acc + d >= step && d > 0) {
      const t = (step - acc) / d;
      const q = {
        x: prev.x + t * (pts[i].x - prev.x),
        y: prev.y + t * (pts[i].y - prev.y),
      };
      out.push(q);
      prev = q;
      d = dist(prev, pts[i]);
      acc = 0;
    }
    acc += d;
  }
  while (out.length < n) out.push(pts[pts.length - 1]);
  return out.slice(0, n);
}

// proper intersection of segments ab and cd (excluding shared endpoints)
function segmentsCross(a, b, c, d) {
  const orient = (p, q, r) =>
    Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  const o1 = orient(a, b, c);
  const o2 = orient(a, b, d);
  const o3 = orient(c, d, a);
  const o4 = orient(c, d, b);
  return o1 !== o2 && o3 !== o4 && o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0;
}

function countCorners(pts, thresholdDeg) {
  const k = 3;
  const threshold = (thresholdDeg * Math.PI) / 180;
  let corners = 0;
  let i = k;
  while (i < pts.length - k) {
    const v1 = { x: pts[i].x - pts[i - k].x, y: pts[i].y - pts[i - k].y };
    const v2 = { x: pts[i + k].x - pts[i].x, y: pts[i + k].y - pts[i].y };
    const m1 = Math.hypot(v1.x, v1.y);
    const m2 = Math.hypot(v2.x, v2.y);
    if (m1 > 0 && m2 > 0) {
      const cos = (v1.x * v2.x + v1.y * v2.y) / (m1 * m2);
      const angle = Math.acos(Math.max(-1, Math.min(1, cos)));
      if (angle > threshold) {
        corners++;
        i += k * 2; // skip past this corner so it isn't double-counted
        continue;
      }
    }
    i++;
  }
  return corners;
}

export function isStarGesture(raw) {
  if (!raw || raw.length < 12) return false;

  const xs = raw.map((p) => p.x);
  const ys = raw.map((p) => p.y);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  if (w < 60 || h < 60) return false; // too small to be deliberate

  // the stroke should come back near where it started
  const diag = Math.hypot(w, h);
  if (dist(raw[0], raw[raw.length - 1]) > diag * 0.35) return false;

  const pts = resample(raw, 64);
  if (!pts) return false;

  let crossings = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    for (let j = i + 3; j < pts.length - 1; j++) {
      if (segmentsCross(pts[i], pts[i + 1], pts[j], pts[j + 1])) crossings++;
    }
  }

  const corners = countCorners(pts, 65);
  return crossings >= 3 && crossings <= 12 && corners >= 3 && corners <= 8;
}
