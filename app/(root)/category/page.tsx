"use client";
import NewsCard from "@/components/NewsCard";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";

const Category = () => {
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
    <div className="mt-4 flex flex-col gap-9">
      <section className="flex flex-col gap-5">
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
      </section>
    </div>
  );
};

export default Category;
