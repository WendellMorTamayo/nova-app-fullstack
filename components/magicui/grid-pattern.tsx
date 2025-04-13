"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface GridPatternProps {
  className?: string;
  width?: number;
  height?: number;
  cellSize?: number;
  cellWidth?: number;
  cellHeight?: number;
  cellThickness?: number;
  gap?: number;
  patternColor?: string;
  [key: string]: any;
}

export const GridPattern = ({
  className,
  width = 100,
  height = 100,
  cellSize = 20,
  cellWidth,
  cellHeight,
  cellThickness = 1.5,
  gap = 2,
  patternColor = "current",
  ...props
}: GridPatternProps) => {
  return (
    <div
      className={cn("absolute inset-0 -z-10 opacity-[0.15]", className)}
      {...props}
    >
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="smallGrid"
            width={cellWidth ?? cellSize}
            height={cellHeight ?? cellSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${cellWidth ?? cellSize} 0 L 0 0 0 ${
                cellHeight ?? cellSize
              }`}
              fill="none"
              stroke={patternColor}
              strokeWidth={cellThickness}
            />
          </pattern>
          <pattern
            id="grid"
            width={(cellWidth ?? cellSize) + gap}
            height={(cellHeight ?? cellSize) + gap}
            patternUnits="userSpaceOnUse"
          >
            <rect
              width={(cellWidth ?? cellSize) + gap}
              height={(cellHeight ?? cellSize) + gap}
              fill="url(#smallGrid)"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};