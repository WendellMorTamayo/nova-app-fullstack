"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";

import { Progress } from "./ui/progress";
import { formatTime } from "@/lib/formatTime";
import { AddToLikesButton } from "./LikeButton";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const NewsPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useUser();
  const [duration, setDuration] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const { audio } = useAudio();

  const [newsId, setNewsId] = useState(audio?.newsId);
  const isOwner = user?.id === audio?.author;

  const togglePlayPause = () => {
    if (audioRef.current?.paused) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };

  const forward = () => {
    if (
      audioRef.current &&
      audioRef.current.currentTime &&
      audioRef.current.duration &&
      audioRef.current.currentTime + 5 < audioRef.current.duration
    ) {
      audioRef.current.currentTime += 5;
    }
  };

  const rewind = () => {
    if (audioRef.current && audioRef.current.currentTime - 5 > 0) {
      audioRef.current.currentTime -= 5;
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    const updateCurrentTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener("timeupdate", updateCurrentTime);

      return () => {
        audioElement.removeEventListener("timeupdate", updateCurrentTime);
      };
    }
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audio?.audioUrl) {
      if (audioElement) {
        audioElement.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      }
      setNewsId(audio?.newsId);
    } else {
      audioElement?.pause();
      setIsPlaying(false);
    }
  }, [audio]);
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div
      className={cn("sticky bottom-0 left-0 flex size-full flex-col", {
        hidden: !audio?.audioUrl || audio?.audioUrl === "",
      })}
    >
      <Progress
        value={(currentTime / duration) * 100}
        className="w-full"
        max={duration}
      />
      <section className="glassmorphism-black flex flex-wrap sm:flex-nowrap h-auto sm:h-[112px] w-full items-center justify-between px-2 sm:px-4 md:px-12 py-3 sm:py-0">
        <audio
          ref={audioRef}
          src={audio?.audioUrl}
          className="hidden"
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
        
        {/* Mobile view: simplified layout */}
        <div className="flex items-center gap-2 sm:hidden w-full mb-2">
          <Link href={`/news/${audio?.newsId}`}>
            <Image
              src={audio?.imageUrl! || "/step-forward 2.svg"}
              width={40}
              height={40}
              alt="player1"
              className="aspect-square rounded-md"
            />
          </Link>
          <div className="flex flex-1 flex-col">
            <h2 className="text-xs truncate font-semibold text-white-1">
              {audio?.title}
            </h2>
            <p className="text-xs font-normal text-white-2">{audio?.author}</p>
            {audio?.source && (
              <p className="text-9 font-normal text-gray-400">
                Source: {audio.source}
              </p>
            )}
          </div>
          {!isOwner ? <AddToLikesButton key={newsId} newsId={newsId} /> : null}
        </div>
        
        {/* Desktop view: original layout */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href={`/news/${audio?.newsId}`}>
            <Image
              src={audio?.imageUrl! || "/step-forward 2.svg"}
              width={64}
              height={64}
              alt="player1"
              className="aspect-square rounded-xl"
            />
          </Link>
          <div className="flex w-[160px] flex-col">
            <h2 className="text-14 truncate font-semibold text-white-1">
              {audio?.title}
            </h2>
            <p className="text-12 font-normal text-white-2">{audio?.author}</p>
            {audio?.source && (
              <p className="text-10 font-normal text-gray-400">
                Source: {audio.source}
              </p>
            )}
          </div>
        </div>
        
        {/* Player controls - similar for both views */}
        <div className="flex cursor-pointer gap-2 md:gap-6 justify-center">
          <div className="flex items-center gap-1.5">
            <Image
              src={"/icons/reverse.svg"}
              width={24}
              height={24}
              alt="rewind"
              onClick={rewind}
              className="cursor-pointer"
            />
            <h2 className="text-xs md:text-12 font-bold text-white-4">-5</h2>
          </div>
          <Image
            src={!isPlaying ? "/circle-play 1.svg" : "/angle-left 2.svg"}
            width={30}
            height={30}
            alt="play"
            onClick={togglePlayPause}
            className="cursor-pointer"
          />
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs md:text-12 font-bold text-white-4">+5</h2>
            <Image
              src={"/icons/forward.svg"}
              width={24}
              height={24}
              alt="forward"
              onClick={forward}
              className="cursor-pointer"
            />
          </div>
        </div>
        
        {/* Additional controls - different for mobile/desktop */}
        <div className="hidden sm:flex items-center gap-6">
          <h2 className="text-16 font-normal text-white-2">
            {formatTime(duration)}
          </h2>
          {!isOwner ? <AddToLikesButton key={newsId} newsId={newsId} /> : null}
          <div className="flex w-full gap-2">
            <Image
              src={isMuted ? "/icons/unmute.svg" : "/icons/mute.svg"}
              width={24}
              height={24}
              alt="mute unmute"
              onClick={toggleMute}
              className="cursor-pointer"
            />
          </div>
        </div>
        
        {/* Mobile additional controls */}
        <div className="flex sm:hidden items-center justify-between w-full">
          <span className="text-xs text-white-2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <Image
            src={isMuted ? "/icons/unmute.svg" : "/icons/mute.svg"}
            width={20}
            height={20}
            alt="mute unmute"
            onClick={toggleMute}
            className="cursor-pointer"
          />
        </div>
      </section>
    </div>
  );
};

export default NewsPlayer;
