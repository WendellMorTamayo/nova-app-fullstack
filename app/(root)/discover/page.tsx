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

const Discover = ({
  searchParams: { search, categories},
}: {
  searchParams: { search: string , categories?: string[]};
}) => {
  const newsData = useQuery(api.news.getNewsBySearch, { search: search , categories: categories });
  const { audio } = useAudio();

  if (!newsData) return <LoaderSpinner />;

  return (
    <div className="mt-4 flex flex-col gap-9">
      <div className="flex flex-col gap-4">
        <h1 className="text-32 font-bold text-white-1">
          {!search ? "Discover News" : "Search results for "}
          {search && <span className="text-white-2">{search}</span>}
        </h1>
        <>
          {newsData.length > 0 ? (
            <div className="podcast_grid">
              {newsData?.map(
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
              <EmptyState title="Try adjusting your search to find what you are looking for" />
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default Discover;
