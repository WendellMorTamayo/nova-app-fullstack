"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Input } from "./ui/input";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "../lib/useDebounce";
import { FilterButton } from "./FilterSheet";
import { Badge } from "./ui/badge";
import { useSearch } from "@/providers/SearchProvider";
import { Loader2 } from "lucide-react";

const Searchbar: React.FC = () => {
  const { 
    search, 
    setSearch, 
    filters, 
    setFilters, 
    sort, 
    setSort, 
    clearSearch: contextClearSearch,
    isLoading,
    setIsLoading
  } = useSearch();
  const searchParams = useSearchParams();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const pathname = usePathname();
  
  const router = useRouter();
  
  // Initialize from URL params if they exist (only once on mount)
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlCategories = searchParams.get("categories");
    const urlSort = searchParams.get("sort");
    
    if (urlSearch) setSearch(urlSearch);
    if (urlCategories) setFilters(urlCategories.split(","));
    if (urlSort) setSort(urlSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedValue = useDebounce(search, 500);

  // Trending search terms - only use keywords without "News" word
  const trendingSearches = useMemo(() => [
    "Sports", "Technology", "Business", "Entertainment", "Politics", "Health", "Science"
  ], []);

  const handleFilterChange = (selectedCategories: string[]) => {
    setFilters(selectedCategories);
  };

  // Generate search suggestions based on input
  useEffect(() => {
    if (search && search.length > 1) {
      // Filter trending searches that match the current input
      const matchedSuggestions = trendingSearches.filter(term => 
        term.toLowerCase().includes(search.toLowerCase())
      );
      setSuggestions(matchedSuggestions);
      setShowSuggestions(matchedSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search, trendingSearches]);

  // Update URL with search parameters
  useEffect(() => {
    // Don't update URL if there are no search parameters
    if (!debouncedValue && filters.length === 0 && (!sort || sort === "relevance")) {
      setIsLoading(false);
      return;
    }
    
    // Set searching state to show loading indicator
    setIsLoading(true);
    
    const query = new URLSearchParams();
    if (debouncedValue) query.set("search", debouncedValue);
    if (filters.length > 0) query.set("categories", filters.join(","));
    if (sort && sort !== "relevance") query.set("sort", sort);

    const queryString = query.toString();
    router.push(queryString ? `/discover?${queryString}` : "/discover");
    
    // Reset searching state when path changes (indicating search completed)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [router, debouncedValue, filters, sort, setIsLoading]);

  // Handle suggestion selection
  const selectSuggestion = (suggestion: string) => {
    setSearch(suggestion);
    setShowSuggestions(false);
    
    // Immediately trigger a search when a trending term is clicked
    const query = new URLSearchParams();
    query.set("search", suggestion);
    if (filters.length > 0) query.set("categories", filters.join(","));
    if (sort) query.set("sort", sort);
    
    // Navigate to the search results
    const queryString = query.toString();
    router.push(`/discover?${queryString}`);
  };

  // Clear search
  const clearSearch = () => {
    contextClearSearch();
    setShowSuggestions(false);
    
    // Clear URL params
    router.push("/discover");
  };

  return (
    <div className="relative mt-8 flex flex-col">
      <div className="flex items-center space-x-4">
        <div className="relative flex-grow">
          <Input
            className="input-class py-6 pl-12 pr-10 focus-visible:ring-offset-orange-1 w-full"
            placeholder="Search for news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {isLoading ? (
            <Loader2 className="absolute left-4 top-3.5 h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Image
              src="/icons/search.svg"
              alt="search"
              height={20}
              width={20}
              className="absolute left-4 top-3.5"
            />
          )}
          
          {search && (
            <button 
              onClick={clearSearch}
              className="absolute right-4 top-3.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
        <FilterButton onFilterChange={handleFilterChange} />
      </div>
      
      {/* Search suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-16 left-0 right-0 z-10 bg-gray-100 dark:bg-black-2 rounded-md shadow-lg p-2 border border-[#5C67DE]/30">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="p-2 hover:bg-gray-200 dark:hover:bg-black-5 rounded cursor-pointer flex items-center transition-colors"
              onClick={() => selectSuggestion(suggestion)}
            >
              <Image
                src="/icons/search.svg"
                alt="search"
                height={14}
                width={14}
                className="mr-2 text-[#5C67DE]"
              />
              <span className="text-black-1 dark:text-white-2">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Trending searches */}
      {!search && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-white-3 mb-2 font-medium">Trending searches</p>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((term, index) => (
              <Badge 
                key={index}
                variant="outline"
                className="cursor-pointer border-[#5C67DE] text-gray-700 dark:text-white-2 hover:bg-gray-200 dark:hover:bg-black-5 hover:text-black-1 dark:hover:text-white-1 transition-colors"
                onClick={() => selectSuggestion(term)}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Searchbar;