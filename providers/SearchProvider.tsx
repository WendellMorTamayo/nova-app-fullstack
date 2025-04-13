"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface SearchContextType {
  search: string;
  setSearch: (search: string) => void;
  clearSearch: () => void;
  filters: string[];
  setFilters: (filters: string[]) => void;
  sort: string;
  setSort: (sort: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [sort, setSort] = useState("relevance");
  const [isLoading, setIsLoading] = useState(false);
  
  const pathname = usePathname();
  
  // Clear search when navigating to different pages
  useEffect(() => {
    clearSearch();
  }, [pathname]);
  
  const clearSearch = () => {
    setSearch("");
    setFilters([]);
    setSort("relevance");
  };

  return (
    <SearchContext.Provider
      value={{
        search,
        setSearch,
        clearSearch,
        filters,
        setFilters,
        sort,
        setSort,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};