import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// Pond-surface simulation: a damped 2D wave equation on a heightmap
// (the classic two-buffer water ripple algorithm). Each disturbance is a
// "drop" that depresses the surface; waves propagate outward, interfere,
// and reflect off the edges, decaying naturally. The surface is rendered
// by lighting the height gradient, so you see moving specular glints on
// dark water rather than drawn circles.
const SIZE = 256; // simulation grid (canvas is upscaled by CSS)
const DAMPING = 0.982;
const DROP_RADIUS = 5;
const DROP_STRENGTH = 130;
const LIGHT = 0.3; // gradient → brightness factor

const RippleWater = forwardRef(function RippleWater({ className }, ref) {
  const canvasRef = useRef(null);
  const buffersRef = useRef(null);

  useImperativeHandle(ref, () => ({
    // x, y in percent of the surface
    disturb(xPct, yPct) {
      const buf = buffersRef.current;
      if (!buf) return;
      const cx = Math.round((xPct / 100) * (SIZE - 1));
      const cy = Math.round((yPct / 100) * (SIZE - 1));
      for (let dy = -DROP_RADIUS; dy <= DROP_RADIUS; dy++) {
        for (let dx = -DROP_RADIUS; dx <= DROP_RADIUS; dx++) {
          const d = Math.hypot(dx, dy);
          if (d > DROP_RADIUS) continue;
          const x = cx + dx;
          const y = cy + dy;
          if (x < 1 || y < 1 || x >= SIZE - 1 || y >= SIZE - 1) continue;
          // cosine profile: deepest at the center, feathered rim
          buf.cur[y * SIZE + x] -=
            DROP_STRENGTH * (0.5 + 0.5 * Math.cos((d / DROP_RADIUS) * Math.PI));
        }
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    const image = ctx.createImageData(SIZE, SIZE);
    const pixels = image.data;

    const buffers = {
      cur: new Float32Array(SIZE * SIZE),
      next: new Float32Array(SIZE * SIZE),
    };
    buffersRef.current = buffers;

    let raf;
    const frame = () => {
      // one physics step per frame: slow, calm wave travel
      for (let s = 0; s < 1; s++) {
        const { cur, next } = buffers;
        for (let y = 1; y < SIZE - 1; y++) {
          const row = y * SIZE;
          for (let x = 1; x < SIZE - 1; x++) {
            const i = row + x;
            const v =
              (cur[i - 1] + cur[i + 1] + cur[i - SIZE] + cur[i + SIZE]) / 2 -
              next[i];
            next[i] = v * DAMPING;
          }
        }
        buffers.cur = next;
        buffers.next = cur;
      }

      // light the surface: brightness follows the slope toward the "sun"
      const h = buffers.cur;
      for (let y = 1; y < SIZE - 1; y++) {
        const row = y * SIZE;
        for (let x = 1; x < SIZE - 1; x++) {
          const i = row + x;
          const shade =
            (h[i + 1] - h[i - 1] + (h[i + SIZE] - h[i - SIZE])) * LIGHT;
          const p = i * 4;
          if (shade > 0) {
            const g = Math.min(shade, 235);
            pixels[p] = 8 + g * 0.97; // warm-white glint
            pixels[p + 1] = 6 + g * 0.94;
            pixels[p + 2] = 6 + g * 0.88;
          } else {
            const d = Math.max(shade * 0.4, -6);
            pixels[p] = 8 + d; // shadow side of the wave
            pixels[p + 1] = 6 + d;
            pixels[p + 2] = 6 + d;
          }
          pixels[p + 3] = 255;
        }
      }
      ctx.putImageData(image, 0, 0);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className={className} />;
});

export default RippleWater;
