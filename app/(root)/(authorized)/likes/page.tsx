"use client";

import EmptyState from "@/components/EmptyState";
import LoaderSpinner from "@/components/LoaderSpinner";
import NewsCard from "@/components/NewsCard";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useQuery } from "convex/react";
import React from "react";

const Likes = () => {
  const likes = useQuery(api.news.getLikes);
  const likesIds = likes?.map((r) => r.news);

  const likedNews = useQuery(api.news.getNewsByMultipleIds, {
    newsIds: likesIds!,
  });
  if (!likedNews) return <LoaderSpinner />;
  return (
    <div className="mt-4 flex flex-col gap-9">
      <section className="flex flex-col gap-5">
        <h1 className="text-32 font-bold text-white-1">Likes</h1>
        {likedNews?.length != undefined && likedNews.length > 0 ? (
          <div className="podcast_grid">
            {likedNews?.map(
              ({ _id, newsTitle, newsDescription, imageUrl, views }: any) => (
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
          <div className="border border-dashed border-gray-400 h-[750px] h-[calc(100vh-300px)]">
            <EmptyState
              title="You have not watched any news yet"
              buttonText="Discover"
              buttonLink="/discover"
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default Likes;
