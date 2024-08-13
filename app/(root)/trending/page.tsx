"use client";
import NewsCard from "@/components/NewsCard";
import React from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import LoaderSpinner from "@/components/LoaderSpinner";

const Trending = () => {
  const trendingNews = useQuery(api.news.getAllNews);

  if (!trendingNews) return <LoaderSpinner />;

  return (
    <div className="mt-4 flex flex-col gap-9">
      <section className="flex flex-col gap-5">
        <h1 className="text-32 font-bold text-white-1">Trending News</h1>
        <div className="podcast_grid">
          {trendingNews
            ?.sort((a, b) => (a.views < b.views ? 1 : -1))
            .map(({ _id, newsTitle, newsDescription, imageUrl, views }) => (
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
      </section>
    </div>
  );
};

export default Trending;
