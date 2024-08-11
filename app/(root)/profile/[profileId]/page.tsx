"use client";

import { useQuery } from "convex/react";

import EmptyState from "@/components/EmptyState";
import LoaderSpinner from "@/components/LoaderSpinner";
import NewsCard from "@/components/NewsCard";
import { api } from "@/convex/_generated/api";
import ProfileCard from "@/components/ProfileCard";

const ProfilePage = ({
  params,
}: {
  params: {
    profileId: string;
  };
}) => {
  const user = useQuery(api.users.getUserById, {
    clerkId: params.profileId,
  });

  const newsData = useQuery(api.news.getNewsByAuthorId, {
    authorId: params.profileId,
  });

  if (!user || !newsData) return <LoaderSpinner />;

  return (
    <section className="mt-9 flex flex-col">
      <h1 className="text-32 font-bold text-white-1 max-md:text-center">
        Newster Profile
      </h1>
      <div className="mt-5 flex flex-col gap-6 max-md:items-center md:flex-row">
        <ProfileCard
          newsData={newsData!}
          imageUrl={user?.imageUrl!}
          userFirstName={user?.name!}
        />
      </div>
      <section className="mt-9 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">All Podcasts</h1>
        {newsData && newsData.news.length > 0 ? (
          <div className="podcast_grid">
            {newsData?.news
              ?.slice(0, 4)
              .map((newsData) => (
                <NewsCard
                  key={newsData._id}
                  imgUrl={newsData.imageUrl!}
                  title={newsData.newsTitle!}
                  description={newsData.newsDescription}
                  newsId={newsData._id}
                />
              ))}
          </div>
        ) : (
          <EmptyState
            title="You have not created any news yet"
            buttonLink="/create-news"
            buttonText="Create News"
          />
        )}
      </section>
    </section>
  );
};

export default ProfilePage;
