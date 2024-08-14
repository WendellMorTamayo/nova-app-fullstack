"use client";

import EmptyState from "@/components/EmptyState";
import LoaderSpinner from "@/components/LoaderSpinner";
import NewsCard from "@/components/NewsCard";
import Searchbar from "@/components/SearchBar";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useQuery } from "convex/react";
import React from "react";

const Recent = () => {
  const recents = useQuery(api.news.getRecents);
  const { audio } = useAudio();
  const recentNewsIds = recents
    ?.sort((a, b) => (a.lastPlayed < b.lastPlayed ? 1 : -1))
    .map((r) => r.news);

  const recentNews = useQuery(api.news.getNewsByMultipleIds, {
    newsIds: recentNewsIds!,
  });

  if (!recentNews) return <LoaderSpinner />;

  return (
    <section
      className={cn("flex flex-col mt-4 gap-4 h-[100vh-70px]", {
        "h-[calc(100vh-400px)]": audio?.audioUrl,
      })}
    >
      <div className="flex flex-col gap-4">
        <h1 className="text-32 font-bold text-white-1">Recent</h1>
        {recentNews?.length != undefined && recentNews.length > 0 ? (
          <div className="podcast_grid">
            {recentNews?.map(
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

export default Recent;
