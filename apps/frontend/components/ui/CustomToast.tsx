"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { toast, ToastPosition } from "./toast";

const DEFAULT_DURATION = 2500;

export default function CustomToast() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState<ToastPosition>("bottom");

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = toast._subscribe(({ message, position = "bottom" }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setMessage(message);
      setPosition(position);
      setOpen(true);

      timeoutRef.current = setTimeout(() => {
        setOpen(false);
        timeoutRef.current = null;
      }, DEFAULT_DURATION);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      unsubscribe();
    };
  }, []);

  function handleDismiss() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(false);
  }

  const posClass = position === "top" ? "top-6" : "bottom-6";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="global-toast"
          initial={{ opacity: 0, y: position === "top" ? -12 : 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === "top" ? -8 : 8, scale: 0.99 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          role="status"
          aria-live="polite"
          className={`fixed left-1/2 -translate-x-1/2 ${posClass} z-50`}
        >
          <div className="pointer-events-auto flex items-center gap-0 rounded-full bg-black text-white px-4 py-2 shadow-lg text-xs sm:text-sm dark:bg-white dark:text-slate-900 font-geist">
            <span className="select-none font-geist tracking-wider">{message}</span>

            {/* Close button */}
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={handleDismiss}
              className="rounded-full p-1 opacity-70 transition hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 dark:focus-visible:ring-slate-400 cursor-pointer hover:cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
