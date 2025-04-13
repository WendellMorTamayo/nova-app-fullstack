"use client";
import NewsCard from "@/components/NewsCard";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useQuery } from "convex/react";
import React, { useState, useEffect } from "react";
import CategoryLoading from "./loading";

// Main component with data handling
function CategoryContent() {
  const { audio } = useAudio();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const categories = ["sports", "entertainment", "technology", "business"];
  const newsData = useQuery(api.news.getAllNews);
  
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
    return CategoryLoading();
  }

  const categorizedNews = categories.map((cat) => {
    return {
      category: cat,
      news: newsData?.filter((news) => news.newsType === cat),
    };
  });

  // Add safe fallback for undefined data
  const hasNews = newsData !== undefined;
  
  return (
    <section
      className={cn("flex flex-col mt-4 gap-4 h-[100vh-70px]", {
        "h-[calc(100vh-400px)]": audio?.audioUrl,
      })}
    >
      <div className="flex flex-col gap-4 overflow-auto">
        {hasNews ? (
          categorizedNews
            .filter(
              (news) => news?.news?.length != undefined && news?.news?.length > 0
            )
            .map(({ category, news }) => (
              <div className="flex flex-col gap-4" key={category}>
                <h1
                  className="text-32 font-bold text-white-1 capitalize"
                  key={category}
                >
                  {category}
                </h1>
                <div className="podcast_grid">
                  {news?.map(
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
              </div>
            ))
        ) : (
          <div className="border border-dashed border-gray-400 h-[400px] flex items-center justify-center">
            <p className="text-white-2">Loading categories...</p>
          </div>
        )}
      </div>
    </section>
  );
}

// Page component that uses loading.tsx
export default function Category() {
  return <CategoryContent />;
}
