import { useEffect, useRef, useState } from "react";

const SRC = `${import.meta.env.BASE_URL}intro-animation.png`;

// Collect the fcTL frame delays of an APNG, in ms.
// (A delay_den of 0 means 1/100s per the APNG spec.)
function apngFrameDelaysMs(buf) {
  const dv = new DataView(buf);
  let off = 8;
  const delays = [];
  while (off + 12 <= dv.byteLength) {
    const len = dv.getUint32(off);
    const type = String.fromCharCode(
      dv.getUint8(off + 4),
      dv.getUint8(off + 5),
      dv.getUint8(off + 6),
      dv.getUint8(off + 7)
    );
    if (type === "fcTL") {
      const num = dv.getUint16(off + 28);
      const den = dv.getUint16(off + 30) || 100;
      delays.push((num / den) * 1000);
    }
    off += 12 + len;
  }
  return delays;
}

// An APNG that waits: the canvas holds the first frame (drawing an animated
// image only ever takes its default frame), and when `playing` flips on, an
// <img> with a fresh blob URL takes over so the animation starts from the
// top. The file is authored to play once, so the browser freezes it on the
// final frame; we just report done when the pass has run its course.
export default function IntroAnimation({ playing, onDone }) {
  const canvasRef = useRef(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const [anim, setAnim] = useState(null); // { blob, doneMs }
  const [playUrl, setPlayUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(SRC)
      .then((r) => r.arrayBuffer())
      .then(async (buf) => {
        // report done a beat after the FINAL frame lands, not after its
        // full hold — the last frame lingers, no need to wait it out
        const delays = apngFrameDelaysMs(buf);
        const total = delays.reduce((a, b) => a + b, 0);
        const last = delays[delays.length - 1] ?? 0;
        const doneMs = Math.min(total - last + 300, total);
        const blob = new Blob([buf], { type: "image/png" });
        const frame = await createImageBitmap(blob);
        if (cancelled) {
          frame.close();
          return;
        }
        const canvas = canvasRef.current;
        canvas.width = frame.width;
        canvas.height = frame.height;
        canvas.getContext("2d").drawImage(frame, 0, 0);
        frame.close();
        setAnim({ blob, doneMs });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The done timer starts when the <img> has actually loaded — the APNG
  // only starts playing then, so counting from any earlier moment would
  // report done while the flower is still visibly moving.
  const doneTimerRef = useRef(null);
  useEffect(() => {
    if (!playing || !anim) return;
    const url = URL.createObjectURL(anim.blob);
    setPlayUrl(url);
    return () => {
      clearTimeout(doneTimerRef.current);
      URL.revokeObjectURL(url);
    };
  }, [playing, anim]);

  return (
    <div className="intro-anim" aria-hidden="true">
      <canvas
        ref={canvasRef}
        style={{ visibility: playUrl ? "hidden" : "visible" }}
      />
      {playUrl && (
        <img
          src={playUrl}
          alt=""
          onLoad={() => {
            doneTimerRef.current = setTimeout(() => {
              onDoneRef.current?.();
            }, anim.doneMs);
          }}
        />
      )}
    </div>
  );
}
