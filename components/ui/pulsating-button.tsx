"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

interface PulsatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulseColor?: string;
  duration?: string;
  asChild?: boolean;
}

const PulsatingButton = forwardRef<HTMLButtonElement, PulsatingButtonProps>(
  (
    {
      className,
      children,
      pulseColor = "#525CCB",
      duration = "1.5s",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        ref={ref}
        className={cn(
          "relative text-center cursor-pointer flex justify-center items-center rounded-lg text-white dark:text-black bg-purple-1 dark:bg-purple-1 px-4 py-2",
          className
        )}
        style={
          {
            "--pulse-color": pulseColor,
            "--duration": duration,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className="relative z-10">{children}</div>
        <div 
          className="absolute top-1/2 left-1/2 size-full rounded-lg bg-inherit -translate-x-1/2 -translate-y-1/2" 
          style={{
            animation: `pulse ${duration} cubic-bezier(0.4, 0, 0.6, 1) infinite`,
            background: pulseColor
          }}
        />
      </Comp>
    );
  }
);

PulsatingButton.displayName = "PulsatingButton";

export default PulsatingButton;
