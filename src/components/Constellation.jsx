import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { skyPos, wrapX } from "../lib/sky.js";

// Convex hull (monotone chain) of the star points — used as an invisible
// hit area so hovering anywhere "within" the constellation reacts, not just
// exactly on a line or star.
function convexHull(points) {
  if (points.length < 3) return null;
  const p = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o, a, b) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const pt of p) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], pt) <= 0
    )
      lower.pop();
    lower.push(pt);
  }
  const upper = [];
  for (const pt of p.reverse()) {
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], pt) <= 0
    )
      upper.pop();
    upper.push(pt);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// One constellation = one entry. The whole field scrolls right-to-left in
// formation along a shallow arc (see lib/sky.js) and wraps around the ring.
// Hovering anywhere on the shape gives a soft reaction; the content star
// opens the card. Entries with `user: true` are visitor-drawn: smaller,
// unnamed, no content star — pure scenery.
export default function Constellation({
  entry,
  name,
  adminMode,
  onRename,
  onOpen,
  onDelete,
}) {
  const isUser = !!entry.user;
  const [nearHover, setNearHover] = useState(false); // anywhere on the shape
  const [starHover, setStarHover] = useState(false); // the content star itself
  const rootRef = useRef(null);

  // Pick the content star once per page load (stable across re-renders).
  const contentIndex = useMemo(() => {
    if (isUser) return -1;
    if (entry.contentStar != null) return entry.contentStar;
    return Math.floor(Math.random() * entry.stars.length);
  }, [entry, isUser]);

  const twinkles = useMemo(
    () => entry.stars.map(() => `-${(Math.random() * 6).toFixed(2)}s`),
    [entry]
  );

  const hull = useMemo(() => convexHull(entry.stars), [entry]);

  // Scatter the chart name somewhere around the shape — above, below, or off
  // either side — but anchored to the stars' actual bounding box (not the
  // container), so the label hugs its constellation.
  const namePos = useMemo(() => {
    const xs = entry.stars.map((s) => s.x);
    const ys = entry.stars.map((s) => s.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const roll = Math.random();
    const alongX = `${Math.round(minX + Math.random() * (maxX - minX) * 0.6)}%`;
    const alongY = `${Math.round(minY + Math.random() * (maxY - minY) * 0.6)}%`;
    if (roll < 0.35) return { left: alongX, top: `calc(${maxY}% + 0.6rem)` };
    if (roll < 0.7)
      return { left: alongX, bottom: `calc(${100 - minY}% + 0.6rem)` };
    if (roll < 0.85)
      return { right: `calc(${100 - minX}% + 0.6rem)`, top: alongY };
    return { left: `calc(${maxX}% + 0.6rem)`, top: alongY };
  }, [entry]);

  // Shared sky scroll: every constellation derives its transform from the
  // same formula of the same clock, so they all move together and wrap.
  // Applied as a pixel translate3d so it stays on the compositor.
  useLayoutEffect(() => {
    const place = (t) => {
      if (!rootRef.current) return;
      const pct = wrapX(entry.field.x - skyPos(t));
      const px = (pct / 100) * window.innerWidth;
      rootRef.current.style.transform = `translate3d(${px}px, 0, 0) scale(var(--m-scale, 1))`;
    };

    place(performance.now());
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let raf;
    const tick = (now) => {
      place(now);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [entry]);

  const contentStar = isUser ? null : entry.stars[contentIndex];

  return (
    <div
      ref={rootRef}
      className={`constellation${nearHover ? " is-near" : ""}${
        starHover ? " is-hovered" : ""
      }`}
      style={{
        left: 0,
        top: `${entry.field.y}%`,
        width: `${entry.field.size}vmin`,
        height: `${entry.field.size}vmin`,
      }}
    >
      <svg viewBox="0 0 100 100" className="constellation-svg">
        {entry.links.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            className="constellation-line"
            x1={entry.stars[a].x}
            y1={entry.stars[a].y}
            x2={entry.stars[b].x}
            y2={entry.stars[b].y}
          />
        ))}
        {entry.stars.map((s, i) => (
          <circle
            key={i}
            className={`star${i === contentIndex ? " star--content" : ""}`}
            cx={s.x}
            cy={s.y}
            r={i === contentIndex ? 4.6 : 3.2}
            style={{ animationDelay: twinkles[i] }}
          />
        ))}

        {/* invisible hit shapes: hovering anywhere on the constellation
            gives the soft reaction; only the content star opens the card */}
        <g
          onMouseEnter={() => setNearHover(true)}
          onMouseLeave={() => setNearHover(false)}
        >
          {hull && (
            <polygon
              className="hull-hit"
              points={hull.map((p) => `${p.x},${p.y}`).join(" ")}
            />
          )}
          {entry.links.map(([a, b]) => (
            <line
              key={`hit-${a}-${b}`}
              className="line-hit"
              x1={entry.stars[a].x}
              y1={entry.stars[a].y}
              x2={entry.stars[b].x}
              y2={entry.stars[b].y}
            />
          ))}
          {entry.stars.map(
            (s, i) =>
              i !== contentIndex && (
                <circle
                  key={`hit-${i}`}
                  className="star-hit"
                  cx={s.x}
                  cy={s.y}
                  r={5}
                />
              )
          )}
          {!isUser && (
            <circle
              className="star-hit star-hit--content"
              cx={contentStar.x}
              cy={contentStar.y}
              r={9}
              role="button"
              tabIndex={0}
              aria-label={`Open: ${entry.title}`}
              onMouseEnter={() => setStarHover(true)}
              onMouseLeave={() => setStarHover(false)}
              onFocus={() => setStarHover(true)}
              onBlur={() => setStarHover(false)}
              onClick={() => onOpen(entry)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(entry);
                }
              }}
            />
          )}
        </g>
      </svg>

      {!isUser && (
        <div
          className="star-label"
          style={{ left: `${contentStar.x}%`, top: `${contentStar.y}%` }}
        >
          {entry.title}
        </div>
      )}

      {isUser && adminMode && (
        <button
          className="constellation-delete"
          onClick={() => onDelete(entry.id)}
          aria-label="Delete this constellation"
        >
          ×
        </button>
      )}

      {!isUser &&
        (adminMode ? (
          <input
            key={name}
            className="constellation-name constellation-name--edit"
            style={namePos}
            defaultValue={name}
            onPointerDown={(e) => e.stopPropagation()}
            onBlur={(e) => onRename(entry.id, e.target.value.trim() || name)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.target.blur();
            }}
          />
        ) : (
          <div className="constellation-name" style={namePos}>
            {name}
          </div>
        ))}
    </div>
  );
}
