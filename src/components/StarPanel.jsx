import { useEffect, useRef, useState } from "react";
import RippleWater from "./RippleWater.jsx";

const MAX_STARS = 6;

// Randomly connect the drawn stars: a random spanning tree (every star is
// reachable) plus, sometimes, one extra chord for character.
function randomLinks(stars) {
  const order = stars.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const links = [];
  for (let i = 1; i < order.length; i++) {
    links.push([order[i], order[Math.floor(Math.random() * i)]]);
  }
  if (stars.length > 3 && Math.random() < 0.5) {
    const a = Math.floor(Math.random() * stars.length);
    const b = Math.floor(Math.random() * stars.length);
    if (
      a !== b &&
      !links.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
    ) {
      links.push([a, b]);
    }
  }
  return links;
}

// Hidden feature: drawing a five-point star on the sky opens this black
// panel — a still pond. Click to set stars (each drop ripples the water);
// pressing Enter connects them into a constellation and releases it into
// the sky. Clicking outside slips away.
// Phases: draw → connect (lines fade in) → dissolve (panel fades away)
// → place (the constellation itself fades into the screen).
export default function StarPanel({ onClose, onComplete }) {
  const [stars, setStars] = useState([]);
  const [links, setLinks] = useState([]);
  const [phase, setPhase] = useState("draw");
  const waterRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const addStar = (e) => {
    if (phase !== "draw") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    waterRef.current?.disturb(x, y); // the pond always answers a touch
    if (stars.length >= MAX_STARS) return;
    setStars((s) => [...s, { x, y }]);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (phase !== "draw") return;
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && stars.length >= 2) {
        const generated = randomLinks(stars);
        setLinks(generated);
        setPhase("connect");
        const t = (fn, ms) => timersRef.current.push(setTimeout(fn, ms));
        t(() => setPhase("dissolve"), 1500);
        t(() => setPhase("place"), 2500);
        t(() => {
          onComplete({ stars: stars.map(({ x, y }) => ({ x, y })), links: generated });
          onClose();
        }, 3600);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, stars, onClose, onComplete]);

  return (
    <div
      className={`star-panel-backdrop phase-${phase}`}
      onClick={() => {
        if (phase === "draw") onClose();
      }}
    >
      <div
        className={`star-panel${stars.length >= MAX_STARS ? " is-full" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          addStar(e);
        }}
      >
        <RippleWater ref={waterRef} className="star-panel-water" />
        <svg
          viewBox="0 0 100 100"
          className="star-panel-svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* soft-edged glowing orb for placed stars */}
            <radialGradient id="panel-star-glow">
              <stop offset="0%" stopColor="#fffdf6" stopOpacity="1" />
              <stop offset="12%" stopColor="#fdf8ec" stopOpacity="0.85" />
              <stop offset="34%" stopColor="#f6edd9" stopOpacity="0.3" />
              <stop offset="62%" stopColor="#f6edd9" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f6edd9" stopOpacity="0" />
            </radialGradient>
          </defs>
          {phase !== "draw" &&
            links.map(([a, b], i) => (
              <line
                key={`${a}-${b}`}
                className="panel-line"
                style={{ animationDelay: `${i * 0.12}s` }}
                x1={stars[a].x}
                y1={stars[a].y}
                x2={stars[b].x}
                y2={stars[b].y}
              />
            ))}
          {stars.map((s, i) => (
            <circle key={i} className="panel-star" cx={s.x} cy={s.y} r={4.4} />
          ))}
        </svg>
      </div>
    </div>
  );
}
