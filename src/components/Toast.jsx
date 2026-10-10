import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Bottom-center toast. Auto-dismisses via `onDone` so notifications can
 * never linger or stack; parents may also clear manually (harmless).
 * Text always renders in the inverse tone for contrast; `kind` tints
 * only the leading bar. Empty messages never render.
 */
const BAR = {
  ok: "var(--lime)",
  success: "var(--lime)",
  error: "var(--danger)",
  warning: "var(--warn)",
  info: "var(--brand)",
};

export default function Toast({ message, kind = "ok", duration = 4000, onDone }) {
  useEffect(() => {
    if (!message || !onDone) return undefined;
    const t = setTimeout(() => onDone(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onDone]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
            role={kind === "error" ? "alert" : "status"}
            className="toast flex w-full max-w-md items-stretch overflow-hidden px-0 py-0 text-left"
          >
            <span style={{ width: 4, background: BAR[kind] || BAR.ok, flexShrink: 0 }} aria-hidden="true" />
            <span className="break-words px-4 py-2.5 text-sm font-semibold" style={{ color: "var(--bg)" }}>
              {message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
