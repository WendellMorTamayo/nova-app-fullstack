"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Image from "next/image";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import NewsDetailPlayer from "@/components/NewsDetailPlayer";
import LoaderSpinner from "@/components/LoaderSpinner";
import NewsCard from "@/components/NewsCard";
import EmptyState from "@/components/EmptyState";

const NewsDetails = ({
  params: { newsId },
}: {
  params: { newsId: Id<"news"> };
}) => {
  const news = useQuery(api.news.getNewsById, { newsId: newsId });
  const similarNews = useQuery(api.news.getNewsByVoiceType, { newsId });

  if (!similarNews || !news) {
    return <LoaderSpinner />;
  }
  return (
    <section className="flex w-full flex-col">
      <header className="mt-9 flex items-center justify-between">
        <h1 className="text-20 font-bold text-white-1"> Currently Playing</h1>
        <figure className="flex gap-3">
          <Image
            src="/headphone.svg"
            alt="headphone"
            width={24}
            height={24}
          ></Image>
          <h2 className="text-16 font-bold text-white-1">{news?.views}</h2>
        </figure>
      </header>
      <NewsDetailPlayer
        newsId={news._id}
        {...news}
        voiceType={news.voiceType}
      />
      <p className="text-white-2 text-16 pb-8 pt-[45px] font-medium max-md:text-center">
        {news?.newsDescription}
      </p>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-18 font-bold text-white-1">Transcription</h1>
          <p className="text-16 font-medium text-white-2">
            {news?.voicePrompt}
          </p>
        </div>
      </div>
      <section className="mt-8 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">Similar News</h1>
        {similarNews && similarNews.length > 0 ? (
          <div className="podcast_grid">
            {similarNews?.map(
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
        ) : (
          <>
            <EmptyState
              title="No Similar News Found"
              buttonLink="/discover"
              buttonText="Discover More news"
            />
          </>
        )}
      </section>
    </section>
  );
};

export default NewsDetails;
