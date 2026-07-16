import { useEffect, useState } from "react";
import entries from "./data/entries.js";
import IntroAnimation from "./components/IntroAnimation.jsx";
import EntryPage from "./components/EntryPage.jsx";

function initialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

// Tiny hash router: "#/" (or no hash) is home, "#/<id>" is that entry's page.
const currentRoute = () => window.location.hash.replace(/^#\/?/, "");

export default function App() {
  const [theme, setTheme] = useState(initialTheme);
  const [route, setRoute] = useState(currentRoute);

  // The flower animation waits on its first frame; the first scroll wakes
  // it. Scrolling itself is native — the page just moves on by.
  const [introAnim, setIntroAnim] = useState("idle"); // idle → playing → done

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const onHash = () => {
      setRoute(currentRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    // #index permalink: the browser's native anchor scroll runs before React
    // has rendered the section, so replay it once the page exists
    if (window.location.hash === "#index") {
      document.getElementById("index")?.scrollIntoView();
    }
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const entry = entries.find((e) => e.id === route);

  useEffect(() => {
    if (introAnim !== "idle" || entry) return;
    const wake = () => setIntroAnim("playing");
    window.addEventListener("scroll", wake, { once: true, passive: true });
    window.addEventListener("wheel", wake, { once: true, passive: true });
    window.addEventListener("touchmove", wake, { once: true, passive: true });
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("touchmove", wake);
    };
  }, [introAnim, entry]);

  return (
    <>
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? "[ night ]" : "[ day ]"}
      </button>

      {entry ? (
        <EntryPage entry={entry} />
      ) : (
        <main>
          {/* four quadrants: name / animation on top, wing / greeting below */}
          <section className="intro">
            <h1 className="intro-name">Cindy Wei</h1>
            <IntroAnimation
              playing={introAnim === "playing"}
              onDone={() => setIntroAnim("done")}
            />
            <img
              className="intro-wing"
              src={`${import.meta.env.BASE_URL}wing.png`}
              alt=""
            />
            <p className="intro-subtext">
              Currently working on software at Imbue.
              <br />
              It&rsquo;s nice to meet you!
              <br />
              @cinxwei
            </p>
          </section>

          {/* below the fold: everything else, as a plain list of links */}
          <section className="index" id="index">
            <ul className="entry-list">
              {entries.map((e) => (
                <li key={e.id}>
                  <a className="entry-link" href={`#/${e.id}`}>
                    {e.title}
                  </a>
                  {e.date && <span className="entry-list-date">{e.date}</span>}
                </li>
              ))}
            </ul>
          </section>
        </main>
      )}
    </>
  );
}
