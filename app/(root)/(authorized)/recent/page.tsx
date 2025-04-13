"use client";

import EmptyState from "@/components/EmptyState";
import LoaderSpinner from "@/components/LoaderSpinner";
import NewsCard from "@/components/NewsCard";
import Searchbar from "@/components/SearchBar";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useQuery } from "convex/react";
import React, { useEffect, useState, Suspense } from "react";
import RecentLoading from "./loading";

// Content component with data loading
const RecentContent = () => {
  const { audio } = useAudio();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const recents = useQuery(api.news.getRecents);
  const recentNewsIds = recents
    ?.sort((a, b) => (a.lastPlayed < b.lastPlayed ? 1 : -1))
    .map((r) => r.news);

  // Only query if we have IDs
  const recentNews = useQuery(
    api.news.getNewsByMultipleIds,
    recentNewsIds && recentNewsIds.length > 0
      ? { newsIds: recentNewsIds }
      : "skip"
  );

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
    return RecentLoading();
  }

  // Add safe checks to handle undefined data
  const hasData = recentNews !== undefined;

  return (
    <section
      className={cn("flex flex-col mt-4 gap-4 h-[100vh-70px]", {
        "h-[calc(100vh-400px)]": audio?.audioUrl,
      })}
    >
      <div className="flex flex-col gap-4">
        <h1 className="text-32 font-bold text-white-1">Recent</h1>
        {!hasData ? (
          <div className="border border-dashed border-gray-400 h-[400px] flex items-center justify-center">
            <p className="text-white-2">Loading recent items...</p>
          </div>
        ) : recentNews?.length != undefined && recentNews.length > 0 ? (
          <div className="podcast_grid">
            {recentNews?.map(
              ({ _id, newsTitle, newsDescription, imageUrl, views }) => (
                <NewsCard
                  key={_id}
                  imgUrl={imageUrl || ""}
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
            <EmptyState
              title="You have not watched any news yet"
              buttonText="Discover"
              buttonLink="/discover"
            />
          </div>
        )}
      </div>
    </section>
  );
};

// Main page component with Suspense boundary
const Recent = () => {
  return (
    <Suspense fallback={<RecentLoading />}>
      <RecentContent />
    </Suspense>
  );
};

export default Recent;