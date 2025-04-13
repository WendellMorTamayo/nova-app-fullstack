"use client";

import { Loader } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  fullScreen?: boolean;
  transparent?: boolean;
}

export function LoadingOverlay({
  isLoading,
  text = "Loading...",
  fullScreen = false,
  transparent = false
}: LoadingOverlayProps) {
  if (!isLoading) return null;
  
  const baseClasses = "flex flex-col items-center justify-center z-40";
  const bgClasses = transparent 
    ? "bg-white/30 dark:bg-black-3/30 backdrop-blur-sm"
    : "bg-white dark:bg-black-3";
  
  const positionClasses = fullScreen
    ? "fixed inset-0"
    : "absolute inset-0";
    
  return (
    <div className={`${baseClasses} ${positionClasses} ${bgClasses}`}>
      <Loader className="animate-spin text-purple-1 mb-2" size={36} />
      {text && <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">{text}</p>}
    </div>
  );
}