"use client";

import EmptyState from "@/components/EmptyState";
import PlaylistCard from "@/components/PlaylistCard";
import Searchbar from "@/components/SearchBar";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useQuery } from "convex/react";
import React from "react";

const Playlist = () => {
  const playlists = useQuery(api.news.getUserPlaylists);

  return (
    <div className="mt-4 flex flex-col gap-9">
      <section className="flex flex-col gap-5">
        <h1 className="text-32 font-bold text-white-1 ">Playlists</h1>
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
          <EmptyState
            title="You have not watched any news yet"
            buttonText="Discover"
            buttonLink="/discover"
          />
        )}
      </section>
    </div>
  );
};

export default Playlist;
