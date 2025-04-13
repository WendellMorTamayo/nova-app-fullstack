"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ModeToggleButton({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // To prevent hydration mismatch, only render once mounted
  if (!mounted) {
    return <div className={cn("w-10 h-10", className)} />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full p-1 transition-all duration-300 shadow-md border border-gray-200 dark:border-gray-800 bg-gray-100 hover:bg-gray-200 dark:bg-black-2 dark:hover:bg-black-3", 
        className
      )}
      aria-label="Toggle theme"
    >
      <div className="relative h-6 w-6">
        {/* Sun (visible in dark mode) */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="absolute inset-0 h-6 w-6 text-yellow-300"
          initial={{ opacity: theme === "dark" ? 1 : 0, rotate: theme === "dark" ? 0 : -45 }}
          animate={{ 
            opacity: theme === "dark" ? 1 : 0, 
            rotate: theme === "dark" ? 0 : -45,
            scale: theme === "dark" ? 1 : 0.5
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </motion.svg>

        {/* Moon (visible in light mode) */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="absolute inset-0 h-6 w-6 text-blue-300"
          initial={{ opacity: theme === "light" ? 1 : 0, rotate: theme === "light" ? 0 : 45 }}
          animate={{ 
            opacity: theme === "light" ? 1 : 0, 
            rotate: theme === "light" ? 0 : 45,
            scale: theme === "light" ? 1 : 0.5 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </motion.svg>
      </div>
    </button>
  );
}