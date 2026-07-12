import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { SCROLL_SPEED, wrapX } from "../lib/sky.js";

// One constellation = one entry. The whole field of constellations scrolls
// right-to-left together (same clock, same speed — formation is preserved)
// and wraps around the viewport. Hovering anywhere on the shape gives a soft
// reaction; only the content star opens the card. Below each shape sits a
// star-chart name label, editable when admin mode is on.
export default function Constellation({
  entry,
  name,
  adminMode,
  onRename,
  onOpen,
}) {
  const [nearHover, setNearHover] = useState(false); // anywhere on the shape
  const [starHover, setStarHover] = useState(false); // the content star itself
  const rootRef = useRef(null);

  // Pick the content star once per page load (stable across re-renders).
  const contentIndex = useMemo(() => {
    if (entry.contentStar != null) return entry.contentStar;
    return Math.floor(Math.random() * entry.stars.length);
  }, [entry]);

  const twinkles = useMemo(
    () => entry.stars.map(() => `-${(Math.random() * 6).toFixed(2)}s`),
    [entry]
  );

  // Shared sky scroll: every constellation derives its x from the same
  // formula of the same clock, so they all move together and wrap. Position
  // is applied as a pixel translate3d (not `left`) so it stays on the
  // compositor and moves smoothly instead of snapping to layout subpixels.
  useLayoutEffect(() => {
    const place = (t) => {
      if (!rootRef.current) return;
      const pct = wrapX(entry.field.x - (t / 1000) * SCROLL_SPEED);
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

  const contentStar = entry.stars[contentIndex];

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
            r={i === contentIndex ? 2.3 : 1.4}
            style={{ animationDelay: twinkles[i] }}
          />
        ))}

        {/* invisible hit shapes: hovering anywhere on the constellation
            gives the soft reaction; only the content star opens the card */}
        <g
          onMouseEnter={() => setNearHover(true)}
          onMouseLeave={() => setNearHover(false)}
        >
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
        </g>
      </svg>

      <div
        className="star-label"
        style={{ left: `${contentStar.x}%`, top: `${contentStar.y}%` }}
      >
        {entry.title}
      </div>

      {adminMode ? (
        <input
          key={name}
          className="constellation-name constellation-name--edit"
          defaultValue={name}
          onPointerDown={(e) => e.stopPropagation()}
          onBlur={(e) => onRename(entry.id, e.target.value.trim() || name)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.target.blur();
          }}
        />
      ) : (
        <div className="constellation-name">{name}</div>
      )}
    </div>
  );
}
