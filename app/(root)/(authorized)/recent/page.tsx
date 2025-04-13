"use client";

import EmptyState from "@/components/EmptyState";
import NewsCard from "@/components/NewsCard";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useQuery } from "convex/react";
import React, { Suspense } from "react";
import RecentLoading from "./loading";

// Content component with improved loading logic
const RecentContent = () => {
  const { audio } = useAudio();
  
  // Fetch recents data
  const recents = useQuery(api.news.getRecents);
  
  // Process recent IDs only when data is available
  const recentNewsIds = recents
    ? recents
        .sort((a, b) => (a.lastPlayed < b.lastPlayed ? 1 : -1))
        .map((r) => r.news)
    : [];

  // Only query if we have IDs
  const recentNews = useQuery(
    api.news.getNewsByMultipleIds,
    recentNewsIds.length > 0
      ? { newsIds: recentNewsIds }
      : "skip"
  );

  // Determine loading states
  const isRecentsLoading = recents === undefined;
  const isNewsLoading = recentNewsIds.length > 0 && recentNews === undefined;
  const isLoading = isRecentsLoading || isNewsLoading;

  // Show loading state when data is being fetched
  if (isLoading) {
    return <RecentLoading />;
  }

  // Render content based on data availability
  return (
    <section
      className={cn("flex flex-col mt-4 gap-4 h-[100vh-70px]", {
        "h-[calc(100vh-400px)]": audio?.audioUrl,
      })}
    >
      <div className="flex flex-col gap-4">
        <h1 className="text-32 font-bold text-white-1">Recent</h1>
        
        {recentNewsIds.length === 0 ? (
          // No recent items found
          <div
            className={cn("border border-dashed border-gray-400 h-[750px]", {
              "h-[calc(100vh-300px)]": audio?.audioUrl,
            })}
          >
            <EmptyState
              title="You have not watched any news yet"
              buttonText="Discover"
              buttonLink="/discover"
            />
          </div>
        ) : recentNews && recentNews.length > 0 ? (
          // Recent items found, display them
          <div className="podcast_grid">
            {recentNews.map((news) => (
              <NewsCard
                key={news._id}
                imgUrl={news.imageUrl || ""}
                title={news.newsTitle || ""}
                description={news.newsDescription || ""}
                newsId={news._id}
                views={news.views || 0}
              />
            ))}
          </div>
        ) : (
          // Fallback for any unexpected state
          <div className="border border-dashed border-gray-400 h-[400px] flex items-center justify-center">
            <p className="text-white-2">No recent items available</p>
          </div>
        )}
      </div>
    </section>
  );
};

// Main component with Suspense boundary
export default function Recent() {
  return (
    <Suspense fallback={<RecentLoading />}>
      <RecentContent />
    </Suspense>
  );
}