import React from 'react';
import { motion } from 'framer-motion';

export const BentoCard = ({ children, className = "", delay = 0, style = {} }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    viewport={{ once: true, margin: "-50px" }}
    style={style}
    className={`bento-card p-6 flex flex-col ${className}`}
  >
    {children}
  </motion.div>
);
