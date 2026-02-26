import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  interactive = false,
  onClick,
  variant = 'default',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variants = {
    default: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg',
    glass: 'bg-white/5 backdrop-blur-3xl border border-white/15 shadow-2xl',
    solid: 'bg-white/10 border border-white/20',
    light: 'bg-white border border-gray-200 shadow-sm',
    'light-glass': 'bg-white/50 backdrop-blur-sm border border-green-100',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:shadow-xl hover:border-white/20 dark:hover:border-white/25'
    : '';

  return (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
      onClick={onClick}
      whileHover={interactive ? { scale: 1.02 } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
