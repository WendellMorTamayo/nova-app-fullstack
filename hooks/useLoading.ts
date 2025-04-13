"use client";

import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import { useState, useCallback, useEffect } from "react";

// Custom hook for managing component-specific loading states
// while also controlling the global loading state when needed
export function useLoading() {
  const [localLoading, setLocalLoading] = useState(false);
  const { setIsLoading: setGlobalLoading } = useGlobalLoading();
  
  // Show local loading state without global overlay
  const startLocalLoading = useCallback(() => {
    setLocalLoading(true);
  }, []);
  
  // Stop local loading state
  const stopLocalLoading = useCallback(() => {
    setLocalLoading(false);
  }, []);
  
  // Show full page loading overlay
  const startGlobalLoading = useCallback(() => {
    setGlobalLoading(true);
  }, [setGlobalLoading]);
  
  // Stop full page loading overlay
  const stopGlobalLoading = useCallback(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);
  
  // Run a function with loading state
  const withLoading = useCallback(async (
    fn: () => Promise<any>, 
    options = { global: false, minDuration: 300 }
  ) => {
    const startTime = Date.now();
    
    if (options.global) {
      startGlobalLoading();
    } else {
      startLocalLoading();
    }
    
    try {
      const result = await fn();
      
      // Ensure minimum loading duration for better UX
      const elapsed = Date.now() - startTime;
      if (elapsed < options.minDuration) {
        await new Promise(resolve => setTimeout(resolve, options.minDuration - elapsed));
      }
      
      return result;
    } finally {
      if (options.global) {
        stopGlobalLoading();
      } else {
        stopLocalLoading();
      }
    }
  }, [startGlobalLoading, stopGlobalLoading, startLocalLoading, stopLocalLoading]);
  
  return {
    isLoading: localLoading,
    startLoading: startLocalLoading,
    stopLoading: stopLocalLoading,
    startGlobalLoading,
    stopGlobalLoading,
    withLoading
  };
}