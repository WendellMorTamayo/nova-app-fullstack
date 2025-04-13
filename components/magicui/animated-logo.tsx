"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AnimatedLogoProps {
  className?: string;
  width?: number;
  height?: number;
  imageClassLight?: string;
  imageClassDark?: string;
  title?: string;
  titleClass?: string;
}

export function AnimatedLogo({
  className,
  width = 70,
  height = 70,
  imageClassLight = "dark:hidden block",
  imageClassDark = "dark:block hidden",
  title,
  titleClass,
}: AnimatedLogoProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={`w-[${width}px] h-[${height}px] relative`}>
          <Image src="/logo.png" alt="logo" width={width} height={height} className={imageClassDark} />
          <Image src="/logo-light.png" alt="logo" width={width} height={height} className={imageClassLight} />
        </div>
        {title && <h1 className={titleClass}>{title}</h1>}
      </div>
    );
  }

  // Staggered dots animation
  const dotsContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const dotVariant = {
    hidden: { opacity: 0, scale: 0 },
    show: { 
      opacity: [0, 1, 0.8],
      scale: [0, 1.2, 1],
      transition: { 
        repeat: Infinity, 
        repeatType: "reverse" as const,
        duration: 1.5,
      }
    },
  };

  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: {
      scale: 1.05,
      rotate: [0, -5, 0, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div
        className="relative"
        initial="initial"
        animate="animate"
        whileHover="hover"
        variants={logoVariants}
      >
        <div className={`relative w-[${width}px] h-[${height}px]`}>
          <Image 
            src="/logo.png" 
            alt="logo" 
            width={width} 
            height={height} 
            className={cn("object-contain", imageClassDark)}
          />
          <Image 
            src="/logo-light.png" 
            alt="logo" 
            width={width} 
            height={height} 
            className={cn("object-contain", imageClassLight)}
          />

          {/* Animated light rays effect */}
          <motion.div 
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="absolute -top-1 -left-1 h-3 w-3 rounded-full bg-purple-500 opacity-40 dark:bg-violet-400 blur-sm"
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-indigo-500 opacity-40 dark:bg-blue-400 blur-sm"
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5 
              }}
            />
          </motion.div>
          
          {/* Pulse effect */}
          <motion.div 
            className="absolute inset-0 rounded-full border border-purple-500 dark:border-purple-400"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
        </div>
      </motion.div>

      {title && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="overflow-hidden"
        >
          <motion.h1
            className={titleClass}
            whileHover={{ scale: 1.03 }}
          >
            {title}
          </motion.h1>
        </motion.div>
      )}
    </div>
  );
}