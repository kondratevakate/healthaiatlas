"use client";

import { motion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed left-0 top-0 h-0.5 bg-primary z-50 origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
