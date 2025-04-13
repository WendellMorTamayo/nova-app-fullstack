"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

// Define the context type
type LoadingContextType = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

// Create the context with default values
const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  setIsLoading: () => {},
});

// Hook to use the loading context
export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted on client-side
    setIsMounted(true);
    
    // Check if we should show loading state
    if (document.readyState === "complete") {
      setIsLoading(false);
    } else {
      const handleLoad = () => {
        // Small timeout to allow components to render
        setTimeout(() => setIsLoading(false), 800);
      };
      
      window.addEventListener("load", handleLoad);
      
      // Start a timer to ensure loading doesn't show indefinitely
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 3000); // Max 3 seconds of loading screen
      
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {(!isMounted || isLoading) ? <LoadingSkeleton /> : children}
    </LoadingContext.Provider>
  );
};