"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  children: React.ReactNode;
  fill?: string;
}

export function Spotlight({
  children,
  className,
  fill = "white",
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        mousePositionRef.current = { x, y };

        // Update the custom properties
        containerRef.current.style.setProperty("--x", `${x}px`);
        containerRef.current.style.setProperty("--y", `${y}px`);
      }
    };

    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (containerElement) {
        containerElement.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [isMounted]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-xl",
        className
      )}
      style={{
        "--x": "0px",
        "--y": "0px",
      } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 z-30 h-full w-full bg-[radial-gradient(circle_at_var(--x)_var(--y),_transparent_25%,_rgba(0,0,0,0.8)_65%)]"
        style={{ opacity: 0.7 }}
      />
      <div
        className="pointer-events-none absolute left-[var(--x)] top-[var(--y)] z-50 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-500/25 to-fuchsia-500/25 blur-md"
        style={{ opacity: 0.25 }}
      />
      <div
        className="pointer-events-none absolute left-[var(--x)] top-[var(--y)] z-50 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-xl"
        style={{ opacity: 0.25 }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}