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
  const { audio } = useAudio();
  const likes = useQuery(api.news.getLikes);
  const likesIds = likes?.map((r) => r.news);

  const likedNews = useQuery(api.news.getNewsByMultipleIds, {
    newsIds: likesIds!,
  });

  if (!likedNews) return <LoaderSpinner />;
  return (
    <section
      className={cn("flex flex-col mt-4 gap-4 h-[100vh-70px]", {
        "h-[calc(100vh-400px)]": audio?.audioUrl,
      })}
    >
      <div className="flex flex-col gap-4">
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

export default Likes;
