import { useEffect } from "react";

const MAX_PULL = 4;

/**
 * Gentle magnetic pull for primary buttons only: the button drifts a few
 * pixels toward the cursor while hovered and springs back on leave.
 * Never moves the click target meaningfully, never delays navigation.
 * Fine pointers + no reduced motion only; disabled buttons are skipped.
 */
export default function MagneticButtons() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    let raf = 0;
    let el = null;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;

    const tick = () => {
      x += (tx - x) * 0.25;
      y += (ty - y) * 0.25;
      if (el) el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e) => {
      const t = e.target instanceof Element ? e.target.closest(".btn-brand") : null;
      if (t && !t.disabled) {
        if (el !== t) {
          if (el) el.style.translate = "";
          el = t;
          x = 0;
          y = 0;
        }
        const r = t.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        tx = Math.max(-MAX_PULL, Math.min(MAX_PULL, dx * 0.06));
        ty = Math.max(-MAX_PULL, Math.min(MAX_PULL, dy * 0.06));
        kick();
      } else if (el) {
        el.style.translate = "";
        el = null;
        tx = 0;
        ty = 0;
        x = 0;
        y = 0;
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
      if (el) el.style.translate = "";
    };
  }, []);

  return null;
}
