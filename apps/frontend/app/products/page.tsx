"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FeatureCardProps, features } from "@/types/interface";
import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.9, rotateX: -8 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#f8f6f2] px-4 py-8 font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="space-y-4 text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Products</p>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl tracking-wider">Cold & Secure Experiences</h1>
          <p className="text-base text-slate-600 md:max-w-2xl tracking-wider">
            Each workflow is crafted with zero-trust principles, buttery-smooth animations, and immersive visuals so your teams stay focused on building secure systems.
          </p>
        </header>

        <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" variants={containerVariants} initial="hidden" animate="show">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </motion.div>
      </div>
    </main>
  );
}

function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <motion.div variants={cardVariants}>
      <Link
        href={feature.route}
        className="group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-[32px] border border-white/10 shadow-[0_25px_80px_rgba(19,17,32,0.25)] transition-transform duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f6f2]"
        aria-label={`Navigate to ${feature.subtitle}`}
      >
        <div className="absolute inset-0">
          <Image
            src={feature.image}
            alt={feature.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 40vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className={`absolute inset-0 bg-linear-to-br ${feature.theme.surface} opacity-80`} />
        <div className={`absolute inset-0 -translate-x-1/3 opacity-0 transition-all duration-700 group-hover:translate-x-0 group-hover:opacity-90 bg-linear-to-r ${feature.theme.hoverGradient}`} />
        <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-500 group-hover:opacity-40" />

        <div className={`relative z-10 flex flex-1 flex-col justify-between gap-6 p-8 ${feature.theme.text}`}>
          <div className="space-y-5">
            <div>
              <p className={`text-xs uppercase tracking-[0.45em] ${feature.theme.accent}`}>{feature.subtitle}</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-widest">{feature.title}</h2>
            </div>
            <p className="text-sm leading-relaxed opacity-90 tracking-widest font-light">{feature.description}</p>
          </div>

          <div className="flex items-center justify-between pt-4 text-sm font-medium uppercase tracking-[0.3em]">
            <span className="opacity-70">Discover</span>
            <span className="rounded-full border border-white/30 p-3 text-white transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
