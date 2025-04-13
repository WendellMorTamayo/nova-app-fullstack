"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GlobalLoadingSkeleton } from "@/components/GlobalLoadingSkeleton";

type GlobalLoadingContextType = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextType>({
  isLoading: true,
  setIsLoading: () => {},
});

export const useGlobalLoading = () => useContext(GlobalLoadingContext);

export const GlobalLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted on client-side
    setIsMounted(true);
    
    // Check if we should show loading state
    if (document.readyState === "complete") {
      // Document already loaded, delay a bit for UI to render
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // Wait for document to load
      const handleLoad = () => {
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      };
      
      window.addEventListener("load", handleLoad);
      
      // Fallback timeout - maximum loading time
      const fallbackTimer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(fallbackTimer);
      };
    }
  }, []);

  return (
    <GlobalLoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isMounted && isLoading && <GlobalLoadingSkeleton />}
      {children}
    </GlobalLoadingContext.Provider>
  );
};