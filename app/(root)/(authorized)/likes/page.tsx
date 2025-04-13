"use client";

import EmptyState from "@/components/EmptyState";
import LoaderSpinner from "@/components/LoaderSpinner";
import NewsCard from "@/components/NewsCard";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useQuery } from "convex/react";
import React, { Suspense } from "react";
import LikesLoading from "./loading";

// Content component that handles the data loading
const LikesContent = () => {
  const { audio } = useAudio();
  
  // Get liked items IDs
  const likes = useQuery(api.news.getLikes);
  const likesIds = likes?.map((r) => r.news);
  
  // Only query if we have IDs
  const likedNews = useQuery(
    api.news.getNewsByMultipleIds, 
    likesIds && likesIds.length > 0 
      ? { newsIds: likesIds } 
      : "skip"
  );

  // Determine loading states more efficiently
  const isLikesLoading = likes === undefined;
  const isNewsLoading = likesIds && likesIds.length > 0 && likedNews === undefined;
  const isLoading = isLikesLoading || isNewsLoading;

  // If any data is still loading, show the loading component
  if (isLoading) {
    return <LikesLoading />;
  }

  // Render content based on data availability
  return (
    <section
      className={cn("flex flex-col mt-4 gap-4 h-[100vh-70px]", {
        "h-[calc(100vh-400px)]": audio?.audioUrl,
      })}
    >
      <div className="flex flex-col gap-4">
        <h1 className="text-32 font-bold text-white-1">Likes</h1>
        
        {/* No likes found - show empty state */}
        {!likesIds?.length ? (
          <div
            className={cn("border border-dashed border-gray-400 h-[750px]", {
              "h-[calc(100vh-300px)]": audio?.audioUrl,
            })}
          >
            <EmptyState
              title="You have not liked any news yet"
              buttonText="Discover"
              buttonLink="/discover"
            />
          </div>
        ) : (
          /* Render liked news items */
          <div className="podcast_grid">
            {likedNews?.map((news) => (
              <NewsCard
                key={news._id}
                imgUrl={news.imageUrl || ""}
                title={news.newsTitle}
                description={news.newsDescription}
                newsId={news._id}
                views={news.views}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Main page component with Suspense boundary
const Likes = () => {
  return (
    <Suspense fallback={<LikesLoading />}>
      <LikesContent />
    </Suspense>
  );
};

export default Likes;