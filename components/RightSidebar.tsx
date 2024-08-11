"use client";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Header from "./Header";
import Carousel from "./Carousel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useAudio } from "@/providers/AudioProvider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const RightSidebar = () => {
  const { user } = useUser();
  const { audio } = useAudio();
  const router = useRouter();
  const topUsers = useQuery(api.users.getTopUserByNewsCount);
  return (
    <section
      className={cn("right_sidebar h-[calc(100vh-5px)]", {
        "h-[calc(100vh-140px)]": audio?.audioUrl,
      })}
    >
      <SignedIn>
        <Link href={`/profile/${user?.id}`} className="flex gap-3 pb-12">
          <UserButton />
          <div className="flex w-full items-center justify-between">
            <h1 className="text-16 truncate font-semibold text-white-1">
              {user?.firstName} {user?.lastName}
            </h1>
            <Image width={12} height={12} src="/arrowRight.svg" alt="arrow" />
          </div>
        </Link>
      </SignedIn>
      <section>
        <Header headerTitle="Fans like you" />
        <Carousel fansLikeDetail={topUsers!} />
      </section>
      <section className="flex flex-col gap-8 pt-12">
        <Header headerTitle="Top Podcastrs" />
        <div className="flex flex-col gap-6">
          {topUsers?.slice(0, 3).map((user) => (
            <div
              key={user._id}
              className="flex cursor-pointer justify-between"
              onClick={() => router.push(`/profile/${user.clerkId}`)}
            >
              <figure className="flex items-center gap-2">
                <Image
                  src={user.imageUrl}
                  alt={user.name}
                  width={44}
                  height={44}
                  className="aspect-square rounded-lg"
                />
                <h2 className="text-14 font-semibold text-white-1">
                  {user.name}
                </h2>
              </figure>
              <div className="flex items-center">
                <p className="text-12 font-normal text-white-1">
                  {user.totalNews} news
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default RightSidebar;
