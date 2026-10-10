import { useEffect, useRef, useState } from "react";

/**
 * Restrained cursor follower: a small lime dot tracking fast plus a thin
 * ring trailing behind. Grows slightly over interactive elements.
 * Fine pointers only, honors reduced motion, never replaces the cursor,
 * never intercepts input. Zero React renders after mount.
 */
export default function CursorFollower() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  // Evaluated once: fine pointers without reduced motion only.
  const [on] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (!on) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    let raf = 0;
    let mx = -100;
    let my = -100;
    let dx = mx;
    let dy = my;
    let rx = mx;
    let ry = my;
    let hot = false;

    const tick = () => {
      dx += (mx - dx) * 0.4;
      dy += (my - dy) * 0.4;
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px) scale(${hot ? 1.5 : 1})`;
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onOver = (e) => {
      hot = !!(e.target instanceof Element && e.target.closest("a, button, [role='button'], input, select, textarea"));
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
    };
  }, [on]);

  if (!on) return null;
  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
