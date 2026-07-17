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
  ); // idle → playing → settling → done
  // bumped each time the intro is re-armed, so the flower remounts fresh
  // (back to its first frame) and can play from the top again
  const [replayKey, setReplayKey] = useState(0);

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
    if (introAnim === "done" || introAnim === "settling" || entry) return;
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

  // Right after the animation finishes, any wheel momentum the visitor built
  // up while waiting would yank the page. Ease scrolling back in instead:
  // for a moment, wheel deltas land scaled by a curve that ramps to full.
  useEffect(() => {
    if (introAnim !== "settling" || entry) return;
    const T = 1400; // ms until scroll is back at full speed
    const t0 = performance.now();
    let released = false;

    const onWheel = (e) => {
      if (released) return;
      const t = (performance.now() - t0) / T;
      if (t >= 1) {
        released = true;
        return;
      }
      e.preventDefault();
      const ease = 0.15 + 0.85 * t * t; // gentle at first, full by T
      window.scrollBy(0, e.deltaY * ease);
    };

    const timer = setTimeout(() => setIntroAnim("done"), T);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("wheel", onWheel);
    };
  }, [introAnim, entry]);

  // Once the animation has finished, scrolling all the way back up to the
  // landing re-arms it: the next downward scroll plays it again from the top.
  // (We only re-arm after the visitor has actually scrolled down first, so
  // the moment the animation ends doesn't instantly trap the page at the top.)
  useEffect(() => {
    if (introAnim !== "done" || entry) return;
    let wentDown = false;
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.5) {
        wentDown = true;
      } else if (window.scrollY === 0 && wentDown) {
        wentDown = false;
        setReplayKey((k) => k + 1);
        setIntroAnim("idle");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [introAnim, entry]);

  return (
    <>
      {entry ? (
        <EntryPage entry={entry} />
      ) : (
        <main>
          {/* name + greeting stacked on the left, flower centered on the right */}
          <section className="intro">
            <h1 className="intro-name">Cindy Wei</h1>
            <p className="intro-subtext">
              Currently working on software at Imbue.
              <br />
              It&rsquo;s nice to meet you!
              <br />
              @cinxwei
            </p>
            <IntroAnimation
              key={replayKey}
              playing={introAnim === "playing"}
              onDone={() => setIntroAnim("settling")}
            />
          </section>

          {/* below the fold: the links on the right, the wing low on the left */}
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
            <img
              className="intro-wing"
              src={`${import.meta.env.BASE_URL}wing.png`}
              alt=""
            />
          </section>
        </main>
      )}
    </>
  );
}
