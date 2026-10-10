import { useEffect } from "react";

const MAX_LIVE = 12;

/**
 * Subtle tap ripple on genuinely interactive surfaces only
 * (links, buttons, role=button). Decorative text is untouched.
 * Nodes are position:fixed (no layout dependency), pointer-transparent,
 * and removed on animation end with a timeout fallback. Capped so rapid
 * tapping can never accumulate unbounded DOM nodes.
 */
export default function Ripple() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const onDown = (e) => {
      const target = e.target instanceof Element
        ? e.target.closest("a, button, [role='button']")
        : null;
      if (!target || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") return;
      if (document.querySelectorAll(".ripple-dot").length >= MAX_LIVE) return;
      const dot = document.createElement("span");
      dot.className = "ripple-dot";
      const size = 14;
      dot.style.left = `${e.clientX - size / 2}px`;
      dot.style.top = `${e.clientY - size / 2}px`;
      const cleanup = () => dot.remove();
      dot.addEventListener("animationend", cleanup);
      setTimeout(cleanup, 700);
      document.body.appendChild(dot);
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  return null;
}
