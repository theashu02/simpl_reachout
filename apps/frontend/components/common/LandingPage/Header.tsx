'use client'

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';


export function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      // style={{ fontFamily: dmSans }}
      className="fixed top-0 left-0 right-0 z-50 py-6"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Left: Dark Pill Nav */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-6 bg-neutral-900/90 backdrop-blur-xl rounded-full px-6 py-3 border border-white/10"
        >
          {/* Logo Inside Pill */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="h-8 flex items-center justify-center px-2">
              <span className="text-background font-bold text-lg">Neural Hash</span>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {['Products', 'Ecosystem', 'Company', 'Blog'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                whileHover={{ y: -1 }}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium cursor-pointer tracking-[1px]"
              >
                {item}
              </motion.a>
            ))}
          </nav>
        </motion.div>

        {/* Right: Explore Products Button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 bg-neutral-900/90 backdrop-blur-xl rounded-full px-6 py-3 border border-white/10 text-white hover:border-white/20 transition-all"
        >
          <span className="text-sm font-medium">Explore products</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.header>
  );
}
