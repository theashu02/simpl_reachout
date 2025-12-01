"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { dmSans } from "@/lib/utils";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(true);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  // Map mouse position to rotation/movement values
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  useEffect(() => {
    // Simulate app loading time (e.g., 3 seconds)
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(onComplete, 800); // Wait for exit animation to finish
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();

    // Calculate normalized position (-0.5 to 0.5)
    const normalizedX = clientX / width - 0.5;
    const normalizedY = clientY / height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onMouseMove={handleMouseMove}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#013330]"
          style={{ fontFamily: dmSans }}
        >
          <div className="absolute inset-0" />

          {/* The Logo Container with 3D Perspective */}
          <div style={{ perspective: 1000 }} className="relative z-10">
            <motion.div
              style={{
                rotateX: rotateX,
                rotateY: rotateY,
              }}
              className="flex flex-col items-center"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl font-black tracking-[-0.04em] text-[#e5ffc3] drop-shadow-[0_15px_40px_rgba(79,70,229,0.35)] md:text-8xl"
              >
                Simpl<span className="text-[#eac2ff]">X</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="mt-6 text-[0.72rem] uppercase tracking-[0.65em] text-white/60">
                Web3 . Security . Compute
              </motion.p>
            </motion.div>
          </div>

          <div className="absolute bottom-12 flex w-64 flex-col gap-3 text-left">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-white/50">Initializing</p>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.8, ease: "easeInOut" }}
                className="absolute inset-0 bg-linear-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_30px_rgba(14,165,233,0.7)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
