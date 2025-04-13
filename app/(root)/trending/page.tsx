"use client";
import NewsCard from "@/components/NewsCard";
import React, { Suspense, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TabContentSkeleton from "@/components/TabContentSkeleton";
import TrendingLoading from "./loading";

// Client Component that handles data loading
function TrendingContent() {
  // Use only parameters that are in the current API interface
  const trendingNews = useQuery(api.news.getTrendingNews);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Initialize loading state and create a delay to ensure loading state is visible
  useEffect(() => {
    // Set a timeout to simulate loading for development purposes
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If still in initial loading, don't render anything
  // This forces Next.js to show the loading.tsx file
  if (isInitialLoading) {
    return TrendingLoading();
  }
  
  // Add fallback handling for undefined or null data
  const hasNews = trendingNews && Array.isArray(trendingNews) && trendingNews.length > 0;

  return (
    <div className="mt-4 flex flex-col gap-9">
      <section className="flex flex-col gap-5">
        <h1 className="text-32 font-bold text-white-1">Trending News</h1>
        {trendingNews === undefined ? (
          // This should never render because of loading.tsx, but just in case
          <div className="border border-dashed border-gray-400 h-[400px] flex items-center justify-center">
            <p className="text-white-2">Loading trending news...</p>
          </div>
        ) : hasNews ? (
          <div className="podcast_grid">
            {trendingNews.map(({ _id, newsTitle, newsDescription, imageUrl, views }) => (
              <NewsCard
                key={_id}
                imgUrl={imageUrl!}
                title={newsTitle}
                description={newsDescription}
                newsId={_id}
                views={views}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-400 h-[400px] flex items-center justify-center">
            <p className="text-white-2">No trending news found</p>
          </div>
        )}
      </section>
    </div>
  );
}

// Page component with explicit loading state and Suspense boundary
export default function Trending() {
  return (
    <Suspense fallback={<TrendingLoading />}>
      <TrendingContent />
    </Suspense>
  );
}