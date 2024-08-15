"use client";
import NewsCard from "@/components/NewsCard";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useQuery } from "convex/react";
import React from "react";

const Category = () => {
  const { audio } = useAudio();
  const categories = ["sports", "entertainment", "technology", "business"];
  const newsData = useQuery(api.news.getAllNews);
  const categorizedNews = categories.map((cat) => {
    return {
      category: cat,
      news: newsData?.filter((news) => news.newsType === cat),
    };
  });
  let count = 0;
  return (
    <section
      className={cn("flex flex-col mt-4 gap-4 h-[100vh-70px]", {
        "h-[calc(100vh-400px)]": audio?.audioUrl,
      })}
    >
      <div className="flex flex-col gap-4">
        {categorizedNews
          .filter(
            (news) => news?.news?.length != undefined && news?.news?.length > 0
          )
          .map(({ category, news }) => (
            <>
              <h1
                className="text-32 font-bold text-white-1 capitalize"
                key={category}
              >
                {category}
              </h1>
              <div className="podcast_grid">
                {news?.map(
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
            </>
          ))}
      </div>
    </section>
  );
};

export default Category;
