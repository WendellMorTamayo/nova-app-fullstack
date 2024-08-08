"use client";
import NewsCard from "@/components/NewsCard";
// import { newsData } from "@/constants";
import React from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

const Trending = () => {
  const trendingNews = useQuery(api.news.getTrendingNews);
  return (
    <div className="mt-9 flex flex-col gap-9">
      <section className="flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">Trending News</h1>
        <div className="podcast_grid">
          {trendingNews?.map(
            ({ _id, newsTitle, newsDescription, imageUrl }) => (
              <NewsCard
                key={_id}
                imgUrl={imageUrl!}
                title={newsTitle}
                description={newsDescription}
                newsId={_id}
              />
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default Trending;
