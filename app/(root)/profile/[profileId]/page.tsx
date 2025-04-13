"use client";

import { useQuery } from "convex/react";
import EmptyState from "@/components/EmptyState";
import NewsCard from "@/components/NewsCard";
import { api } from "@/convex/_generated/api";
import ProfileCard from "@/components/ProfileCard";
import ProfileLoading from "./loading";
import CreateUserButton from "@/components/CreateUserButton";
import { useUser } from "@clerk/nextjs";

// Profile content component with improved loading logic
function ProfileContent({
  profileId
}: {
  profileId: string;
}) {
  // Fetch user data
  const user = useQuery(api.users.getUserById, {
    clerkId: profileId,
  });

  // Fetch news data
  const newsData = useQuery(api.news.getNewsByAuthorId, {
    authorId: profileId,
  });
  
  // Determine loading state based on query results
  const isUserLoading = user === undefined;
  const isNewsLoading = newsData === undefined;
  const isLoading = isUserLoading || isNewsLoading;

  // If data is still loading, show the loading component
  if (isLoading) {
    return <ProfileLoading />;
  }

  // Get Clerk user data
  const { user: clerkUser, isSignedIn } = useUser();
  
  // If the user wasn't found (null was returned), show a not found state
  if (user === null) {
    // Check if this is the current user trying to view their own profile
    const isCurrentUser = isSignedIn && clerkUser?.id === profileId;
    
    return (
      <section className="mt-9 flex flex-col items-center justify-center gap-4">
        <EmptyState
          title={isCurrentUser ? "Complete Your Registration" : "User not found"}
          description={
            isCurrentUser 
              ? "Your user profile hasn't been created in our database. Click the button below to fix this."
              : "The user you're looking for doesn't exist or has been deleted."
          }
          buttonLink={!isCurrentUser ? "/" : undefined}
          buttonText={!isCurrentUser ? "Go Home" : undefined}
        />
        
        {isCurrentUser && (
          <div className="mt-4">
            <CreateUserButton />
          </div>
        )}
      </section>
    );
  }

  // Transform the data to match the expected types
  const profileNewsData = {
    news: newsData?.news?.map(news => ({
      ...news,
      audioStorageId: news.audioStorageId || null,
      imageStorageId: news.imageStorageId || null,
      audioUrl: news.audioUrl || null, // Convert undefined to null
      imageUrl: news.imageUrl || null, // Convert undefined to null
      views: news.views || 0,
    })) || [],
    listeners: newsData?.listeners || 0
  };

  return (
    <section className="mt-9 flex flex-col">
      <h1 className="text-32 font-bold text-white-1 max-md:text-center">
        Newster Profile
      </h1>
      <div className="mt-5 flex flex-col gap-6 max-md:items-center md:flex-row">
        <ProfileCard
          newsData={profileNewsData}
          imageUrl={user?.imageUrl || ""}
          userFirstName={user?.name || "User"}
        />
      </div>
      <section className="mt-9 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">All Podcasts</h1>
        {newsData?.news && newsData.news.length > 0 ? (
          <div className="podcast_grid">
            {newsData.news
              .slice(0, 4)
              .map((news) => (
                <NewsCard
                  key={news._id}
                  imgUrl={news.imageUrl || ""}
                  title={news.newsTitle || "Untitled"}
                  description={news.newsDescription}
                  newsId={news._id}
                  views={news.views || 0}
                  source={news.source}
                />
              ))}
          </div>
        ) : (
          <EmptyState
            title="No news articles found"
            buttonLink="/create-news"
            buttonText="Create News"
          />
        )}
      </section>
    </section>
  );
}

// Page component that passes params to content component
export default function ProfilePage({
  params,
}: {
  params: {
    profileId: string;
  };
}) {
  return <ProfileContent profileId={params.profileId} />;
}