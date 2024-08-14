"use client";

import EmptyState from "@/components/EmptyState";
import NewsCard from "@/components/NewsCard";
import Searchbar from "@/components/SearchBar";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useQuery } from "convex/react";
import React from "react";

const Recent = () => {
  const recents = useQuery(api.news.getRecents);
  const recentNewsIds = recents
    ?.sort((a, b) => (a._creationTime < b._creationTime ? 1 : -1))
    .map((r) => r.news);

  const recentNews = useQuery(api.news.getNewsByMultipleIds, {
    newsIds: recentNewsIds!,
  });

  return (
    <div className="mt-4 flex flex-col gap-9">
      <section className="flex flex-col gap-5">
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
          <EmptyState
            title="You have not watched any news yet"
            buttonText="Discover"
            buttonLink="/discover"
          />
        )}
      </section>
    </div>
  );
};

export default Recent;
