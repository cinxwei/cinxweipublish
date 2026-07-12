import { useEffect, useRef, useState } from "react";
import entries from "./data/entries.js";
import Constellation from "./components/Constellation.jsx";
import ContentCard from "./components/ContentCard.jsx";
import { loadNames, saveName } from "./lib/names.js";
import { isStarGesture } from "./lib/starGesture.js";

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
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const rename = (id, name) => {
    saveName(id, name);
    setNames((prev) => ({ ...prev, [id]: name }));
  };

  // Draw a five-point star (press, drag the classic single-stroke star,
  // release) anywhere on the sky to toggle admin mode.
  const drawingRef = useRef(false);
  useEffect(() => {
    let pts = [];

    const down = (e) => {
      if (e.button !== 0) return;
      if (e.target.closest?.(".card, input, button")) return;
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
      if (isStarGesture(pts)) setAdminMode((a) => !a);
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
    <main className="sky">
      <header className="masthead">
        <h1>cindy wei</h1>
      </header>

      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? "night" : "day"}
      </button>

      {adminMode && (
        <div className="admin-badge">
          admin — click a constellation&rsquo;s name to edit · draw the star
          again to exit
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

      {trail.length > 1 && (
        <svg className="gesture-trail">
          <polyline points={trail.map((p) => `${p.x},${p.y}`).join(" ")} />
        </svg>
      )}

      {active && <ContentCard entry={active} onClose={() => setActive(null)} />}
    </main>
  );
}
