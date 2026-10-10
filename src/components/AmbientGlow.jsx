import { useEffect, useRef } from "react";

/**
 * Cursor-following ambient glow. A single fixed div is repositioned via
 * direct DOM mutation inside requestAnimationFrame — zero React renders.
 * Renders nothing on touch devices, coarse pointers, or reduced motion.
 * Always behind content (z-index -1), pointer-transparent.
 */
export default function AmbientGlow() {
  const ref = useRef(null);
  const coreRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const core = coreRef.current;
    if (!el || !core) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    let raf = 0;
    let tx = -600;
    let ty = -600;
    let x = tx;
    let y = ty;
    let cx = tx;
    let cy = ty;
    let running = false;

    const tick = () => {
      // Smooth easing toward the pointer; snap when close to rest.
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      // Specular core tracks tighter and leads the halo slightly.
      cx += (tx + 46 - cx) * 0.16;
      cy += (ty + 46 - cy) * 0.16;
      if (Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5) {
        running = false;
        return;
      }
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      core.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e) => {
      tx = e.clientX - 230;
      ty = e.clientY - 230;
      const hot = !!(e.target instanceof Element && e.target.closest("a, button, [role='button']"));
      el.classList.toggle("hot", hot);
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ref} className="ambient-glow" aria-hidden="true" />
      <div ref={coreRef} className="ambient-core" aria-hidden="true" />
    </>
  );
}
