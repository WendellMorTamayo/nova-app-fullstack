"use client";

import EmptyState from "@/components/EmptyState";
import NewsCard from "@/components/NewsCard";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useQuery } from "convex/react";
import React, { useMemo, useState, useEffect, Suspense } from "react";
import DiscoverLoading from "./loading";
import { useSearchParams } from "next/navigation";

// Content component with data fetching
function DiscoverContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const categoriesParam = searchParams.get('categories');
  const categories = categoriesParam ? categoriesParam.split(',') : undefined;
  const sortParam = searchParams.get('sort');
  
  const [activeSort, setActiveSort] = useState<string>(sortParam || "relevance");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { audio } = useAudio();
  
  // Use only parameters that are in the current API interface
  const newsData = useQuery(api.news.getNewsBySearch, { 
    search: search, 
    categories: categories
  });

  // Initialize loading state and create a delay to ensure loading state is visible
  useEffect(() => {
    // Set a timeout to simulate loading for development purposes
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Client-side sorting since we can't use server sorting yet
  const sortedNewsData = useMemo(() => {
    if (!newsData) return [];
    
    // Default to empty array if not an array
    const newsArray = Array.isArray(newsData) ? [...newsData] : [];
    
    if (activeSort === "trending") {
      // Sort by views (trending)
      return newsArray.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (activeSort === "recent") {
      // Sort by creation time (newest first)
      return newsArray.sort((a, b) => b._creationTime - a._creationTime);
    } else {
      // Default relevance sorting - keep original order which is already sorted by relevance
      // If search term is present, original order is relevance-based
      // If no search term, default to most viewed
      return search ? newsArray : newsArray.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
  }, [newsData, activeSort, search]);
  
  // If still in initial loading, don't render anything
  // This forces Next.js to show the loading.tsx file
  if (isInitialLoading) {
    return DiscoverLoading();
  }
  
  // Add fallback handling for undefined or null data
  const hasNews = sortedNewsData && Array.isArray(sortedNewsData) && sortedNewsData.length > 0;

  const handleSortChange = (newSort: string) => {
    setActiveSort(newSort);
  };

  return (
    <div className="mt-4 flex flex-col gap-9">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-32 font-bold text-white-1">
            {!search ? "Discover News" : "Search results for "}
            {search && <span className="text-white-2">{search}</span>}
          </h1>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => handleSortChange("relevance")}
              className={`px-3 py-1 text-sm rounded-full ${activeSort === "relevance" ? 
                "bg-[#5C67DE] text-white" : "bg-black-2 text-gray-300"}`}
            >
              Relevance
            </button>
            <button 
              onClick={() => handleSortChange("trending")}
              className={`px-3 py-1 text-sm rounded-full ${activeSort === "trending" ? 
                "bg-[#5C67DE] text-white" : "bg-black-2 text-gray-300"}`}
            >
              Trending
            </button>
            <button 
              onClick={() => handleSortChange("recent")}
              className={`px-3 py-1 text-sm rounded-full ${activeSort === "recent" ? 
                "bg-[#5C67DE] text-white" : "bg-black-2 text-gray-300"}`}
            >
              Newest
            </button>
          </div>
        </div>
        
        <>
          {hasNews ? (
            <div className="podcast_grid">
              {sortedNewsData.map(
                ({ _id, newsTitle, newsDescription, imageUrl, views }) => (
                  <NewsCard
                    key={_id}
                    imgUrl={imageUrl!}
                    title={newsTitle}
                    description={newsDescription}
                    newsId={_id}
                    views={views}
                  />
                )
              )}
            </div>
          ) : (
            <div
              className={cn("border border-dashed border-gray-400 h-[750px]", {
                "h-[calc(100vh-300px)]": audio?.audioUrl,
              })}
            >
              {newsData === undefined ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-white-2">No results found</p>
                </div>
              ) : (
                <EmptyState title="Try adjusting your search to find what you are looking for" />
              )}
            </div>
          )}
        </>
      </div>
    </div>
  );
}

// Page component wrapped in Suspense
export default function Discover() {
  return (
    <Suspense fallback={<DiscoverLoading />}>
      <DiscoverContent />
    </Suspense>
  );
}