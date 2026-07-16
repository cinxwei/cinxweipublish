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
  // no toggle for now — the theme just follows the last saved choice or
  // the system preference
  const [theme] = useState(initialTheme);
  const [route, setRoute] = useState(currentRoute);

  // The flower animation waits on its first frame; the first scroll intent
  // wakes it instead of moving the page, and the page stays parked at the
  // intro until the animation has finished. (Arriving directly at the
  // #index permalink skips the wait.)
  const [introAnim, setIntroAnim] = useState(() =>
    window.location.hash === "#index" ? "done" : "idle"
  ); // idle → playing → done

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
    if (introAnim === "done" || entry) return;
    const wake = () =>
      setIntroAnim((s) => (s === "idle" ? "playing" : s));

    const onWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) wake();
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      wake();
    };
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea")) return;
      if (
        ["ArrowDown", "PageDown", "End", "ArrowUp", "PageUp", "Home"].includes(
          e.key
        ) ||
        e.key === " "
      ) {
        e.preventDefault();
        if (["ArrowDown", "PageDown", "End", " "].includes(e.key)) wake();
      }
    };
    // backstop: whatever the input path (scrollbar drag, find-in-page...),
    // the page stays parked at the intro
    const onScroll = () => {
      if (window.scrollY > 0) window.scrollTo(0, 0);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [introAnim, entry]);

  return (
    <>
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
