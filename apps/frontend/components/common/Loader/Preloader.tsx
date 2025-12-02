"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Complete loading after progress reaches 100
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(onComplete, 600);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a192f]"
        >
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="flex flex-col items-center gap-8">
            <h1 className="text-7xl font-bold tracking-tight text-[#64ffda] md:text-8xl">
              Simpl<span className="text-[#5eead4]">X</span>
            </h1>

            {/* Progress Bar */}
            <div className="flex w-64 flex-col gap-2">
              <div className="relative h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div style={{ width: `${progress}%` }} transition={{ duration: 0.1 }} className="h-full bg-[#06b6d4]" />
              </div>
              <p className="text-center text-xs font-medium text-[#67e8f9]">{progress}%</p>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="absolute bottom-12 text-xs uppercase tracking-widest text-[#8892b0]">
            Web3 · Security · Compute
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
