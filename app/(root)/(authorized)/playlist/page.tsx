"use client";

import EmptyState from "@/components/EmptyState";
import LoaderSpinner from "@/components/LoaderSpinner";
import PlaylistCard from "@/components/PlaylistCard";
import Searchbar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useQuery } from "convex/react";
import React from "react";

const Playlist = () => {
  const playlists = useQuery(api.news.getUserPlaylists);
  const { audio } = useAudio();

  if (!playlists) return <LoaderSpinner />;
  return (
    <section
      className={cn("flex flex-col mt-4 gap-4 h-[100vh-70px]", {
        "h-[calc(100vh-400px)]": audio?.audioUrl,
      })}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between flex-row">
          <h1 className="text-32 font-bold text-white-1 ">Playlists</h1>
          <Button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-plus"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </Button>
        </div>

        {playlists?.length != undefined && playlists.length > 0 ? (
          <div className="podcast_grid">
            {playlists?.map(({ _id, playlistName }) => (
              <PlaylistCard
                key={_id}
                playlistName={playlistName}
                isNew={false}
                imgSrc="/playlist.jpeg"
              />
            ))}
            <PlaylistCard
              key="empty"
              playlistName="Create New Playlist"
              isNew={true}
              imgSrc="/add.png"
            />
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

export default Playlist;
