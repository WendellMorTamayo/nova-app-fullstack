"use client";

import EmptyState from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import React from "react";

const Likes = () => {
  const { audio } = useAudio();

  return (
    <section
      className={cn("flex flex-col mt-4 gap-4 h-[100vh-70px]", {
        "h-[calc(100vh-400px)]": audio?.audioUrl,
      })}
    >
      <div className="flex flex-col gap-4"> 
        <h1 className="text-32 font-bold text-white-1">Likes</h1>
        <div
          className={cn("border border-dashed border-gray-400 h-[750px]", {
            "h-[calc(100vh-300px)]": audio?.audioUrl,
          })}
        >
          <EmptyState
            title="You have not liked any news yet"
            buttonText="Discover"
            buttonLink="/discover"
          />
        </div>
      </div>
    </section>
  );
};

export default Likes;
