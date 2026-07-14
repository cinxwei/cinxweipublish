import { useEffect, useRef, useState } from "react";
import entries from "./data/entries.js";
import Constellation from "./components/Constellation.jsx";
import ContentCard from "./components/ContentCard.jsx";
import StarPanel from "./components/StarPanel.jsx";
import { loadNames, saveName } from "./lib/names.js";
import { isStarGesture } from "./lib/starGesture.js";
import { WRAP_SPAN, WRAP_MIN, nudgeSky } from "./lib/sky.js";

function initialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme);
  const [active, setActive] = useState(null);
  const [names, setNames] = useState(() => loadNames(entries));
  const [adminMode, setAdminMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [userConstellations, setUserConstellations] = useState([]);
  const [trail, setTrail] = useState([]);
  const introRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const rename = (id, name) => {
    saveName(id, name);
    setNames((prev) => ({ ...prev, [id]: name }));
  };

  // Visitor-drawn constellations: smaller and unnamed, dropped at a random
  // phase on the sky ring to circle with everything else.
  const addUserConstellation = ({ stars, links }) => {
    setUserConstellations((prev) => [
      ...prev,
      {
        id: `user-${prev.length}-${Math.random().toString(36).slice(2, 7)}`,
        user: true,
        stars,
        links,
        field: {
          x: WRAP_MIN + Math.random() * WRAP_SPAN,
          y: 10 + Math.random() * 60,
          size: 10 + Math.random() * 8,
        },
      },
    ]);
  };

  // The page is one document: the pearl intro on top, the sky below it.
  // Vertical scrolling is velocity-assisted between the two: a small nudge
  // settles back, a real scroll commits and the page carries you the rest
  // of the way — in either direction.
  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const COMMIT = 90; // px scrolled before the assist commits
    const ACCEL = 2.2;
    const MAX_V = 3200;
    const FRICTION = 6;

    let dir = 0; // +1 heading to the sky, -1 back to the intro
    let v = 0;
    let raf = 0;
    let last = 0;
    let committed = false;
    let touchY = null;

    const skyTop = () =>
      introRef.current?.offsetHeight ?? window.innerHeight;

    const stop = (snapTo) => {
      if (snapTo != null) window.scrollTo(0, snapTo);
      dir = 0;
      v = 0;
      committed = false;
      raf = 0;
    };

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const st = skyTop();
      const origin = dir === 1 ? 0 : st;
      const target = dir === 1 ? st : 0;
      let pos = window.scrollY + dir * v * dt;
      const dist = Math.abs(pos - origin);

      if (!committed && dist >= COMMIT) committed = true;
      if (committed) {
        v = Math.min(v * (1 + ACCEL * dt), MAX_V);
      } else {
        v *= Math.max(0, 1 - FRICTION * dt);
        if (v < 20) pos = origin + (pos - origin) * Math.max(0, 1 - 5 * dt);
      }

      if ((dir === 1 && pos >= target) || (dir === -1 && pos <= target)) {
        stop(target);
        return;
      }
      window.scrollTo(0, pos);
      if (!committed && v < 1 && Math.abs(pos - origin) < 0.5) {
        stop(origin);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const push = (d, amount) => {
      const st = skyTop();
      const pos = window.scrollY;
      if (dir === 0) {
        if (d === 1 && pos >= st - 2) return; // already at the sky
        if (d === -1 && pos <= 1) return; // already at the top
        dir = d;
        committed = false;
      } else if (dir !== d) {
        v = Math.max(0, v - amount); // opposing input brakes
        return;
      }
      v += amount;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const overlayOpen = (target) =>
      !!target.closest?.(".card-backdrop, .star-panel-backdrop");

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // horizontal → sky nudge
      e.preventDefault();
      if (overlayOpen(e.target)) return;
      push(e.deltaY > 0 ? 1 : -1, Math.abs(e.deltaY) * 4);
    };

    const onKey = (e) => {
      if (e.target.closest?.("input")) return;
      if (["ArrowDown", "PageDown"].includes(e.key)) {
        e.preventDefault();
        push(1, 500);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        push(-1, 500);
      }
    };

    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (touchY == null) return;
      const dy = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      if (overlayOpen(e.target)) return;
      if (dy !== 0) {
        e.preventDefault();
        push(dy > 0 ? 1 : -1, Math.abs(dy) * 8);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Horizontal scrolling pushes the sky along — swipe left to hurry the
  // rotation, right to hold it back; it eases back to the ambient drift.
  useEffect(() => {
    const onWheel = (e) => nudgeSky(e.deltaX * 0.04);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // Draw a five-point star (press, drag the classic single-stroke star,
  // release) anywhere on the sky to open the star-drawing panel.
  const drawingRef = useRef(false);
  useEffect(() => {
    let pts = [];

    const down = (e) => {
      if (e.button !== 0) return;
      if (
        e.target.closest?.(
          ".card, .star-panel-backdrop, .intro, input, button"
        )
      )
        return;
      pts = [{ x: e.clientX, y: e.clientY }];
      drawingRef.current = true;
    };

    const move = (e) => {
      if (!drawingRef.current) return;
      pts.push({ x: e.clientX, y: e.clientY });
      if (pts.length > 8) setTrail([...pts]);
    };

    const up = () => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      if (isStarGesture(pts)) setPanelOpen(true);
      pts = [];
      setTrail([]);
    };

    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <>
      {/* shared gradients: stars render as soft glowing balls, not hard
          circles. stop colors follow the theme via CSS variables */}
      <svg className="svg-defs" aria-hidden="true">
        <defs>
          <radialGradient id="star-ball">
            <stop className="ball-core" offset="0%" />
            <stop className="ball-mid" offset="30%" />
            <stop className="ball-edge" offset="62%" />
            <stop className="ball-out" offset="100%" />
          </radialGradient>
          <radialGradient id="star-ball-content">
            <stop className="ball-core" offset="0%" />
            <stop className="ball-warm-mid" offset="30%" />
            <stop className="ball-warm-edge" offset="62%" />
            <stop className="ball-warm-out" offset="100%" />
          </radialGradient>
        </defs>
      </svg>

      <section className="intro" ref={introRef}>
        <h1 className="intro-name">cindy wei</h1>
        <p className="intro-subtext">
          Currently working on software @ Imbue.
          <br />
          It&rsquo;s nice to meet you.
        </p>
      </section>

      <main className="sky">
        <header className="masthead">
          <h1>
            <button
              className="masthead-name"
              onClick={() => setAdminMode((a) => !a)}
              aria-pressed={adminMode}
            >
              cindy wei
            </button>
          </h1>
        </header>

        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? "[ night ]" : "[ day ]"}
        </button>

        {adminMode && (
          <div className="admin-badge">
            admin — click a constellation&rsquo;s name to edit · click your
            name to exit
          </div>
        )}

        {entries.map((entry) => (
          <Constellation
            key={entry.id}
            entry={entry}
            name={names[entry.id]}
            adminMode={adminMode}
            onRename={rename}
            onOpen={setActive}
          />
        ))}

        {userConstellations.map((entry) => (
          <Constellation
            key={entry.id}
            entry={entry}
            adminMode={adminMode}
            onDelete={(id) =>
              setUserConstellations((prev) => prev.filter((c) => c.id !== id))
            }
          />
        ))}
      </main>

      {trail.length > 1 && (
        <svg className="gesture-trail">
          <polyline points={trail.map((p) => `${p.x},${p.y}`).join(" ")} />
        </svg>
      )}

      {panelOpen && (
        <StarPanel
          onClose={() => setPanelOpen(false)}
          onComplete={addUserConstellation}
        />
      )}

      {active && <ContentCard entry={active} onClose={() => setActive(null)} />}
    </>
  );
}
