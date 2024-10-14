"use client";
import { useMutation } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { useAudio } from "@/providers/AudioProvider";
import { newsDetailPlayerProps } from "@/types";

import LoaderSpinner from "./LoaderSpinner";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

const NewsDetailPlayer = ({
  audioUrl,
  newsTitle,
  author,
  imageUrl,
  newsId,
  imageStorageId,
  audioStorageId,
  // isOwner,
  authorImageUrl,
  authorId,
  voiceType,
}: newsDetailPlayerProps) => {
  const router = useRouter();
  const { setAudio } = useAudio();
  const { toast } = useToast();
  // const [isDeleting, setIsDeleting] = useState(false);
  // const deletePodcast = useMutation(api.news.deletePodcast);

  // const handleDelete = async () => {
  //   try {
  //     await deletePodcast({ podcastId, imageStorageId, audioStorageId });
  //     toast({
  //       title: "Podcast deleted",
  //     });
  //     router.push("/");
  //   } catch (error) {
  //     console.error("Error deleting podcast", error);
  //     toast({
  //       title: "Error deleting podcast",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handlePlay = () => {
    setAudio({
      title: newsTitle,
      audioUrl,
      imageUrl,
      author,
      newsId,
    });
    console.log(audioUrl);
  };

  if (!imageUrl || !authorImageUrl) return <LoaderSpinner />;

  return (
    <div className="mt-6 flex w-full justify-between max-md:justify-center">
      <div className="flex flex-col gap-8 max-md:items-center md:flex-row">
        <Image
          src={imageUrl}
          width={250}
          height={250}
          alt="News image"
          className="aspect-square rounded-lg"
        />
        <div className="flex w-full flex-col gap-5 max-md:items-center md:gap-9">
          <article className="flex flex-col gap-2 max-md:items-center">
            <h1 className="text-32 font-extrabold tracking-[-0.32px] text-white-1">
              {newsTitle}
            </h1>
            <figure
              className="flex cursor-pointer items-center gap-2"
              onClick={() => {
                router.push(`/profile/${authorId}`);
              }}
            ></figure>
          </article>

          <Button
            onClick={handlePlay}
            className="text-16 w-full max-w-[250px] bg-purple-1 font-extrabold text-white-1"
          >
            <Image
              src="/circle-play 1.svg"
              width={20}
              height={20}
              alt="random play"
            />{" "}
            &nbsp; Play
          </Button>
        </div>
      </div>
      {/* {isOwner && (
        <div className="relative mt-2">
          <Image
            src="/icons/three-dots.svg"
            width={20}
            height={30}
            alt="Three dots icon"
            className="cursor-pointer"
            onClick={() => setIsDeleting((prev) => !prev)}
          /> */}
      {/* {isDeleting && (
            <div
              className="absolute -left-32 -top-2 z-10 flex w-32 cursor-pointer justify-center gap-2 rounded-md bg-black-6 py-1.5 hover:bg-black-2"
              onClick={handleDelete}
            >
              <Image
                src="/icons/delete.svg"
                width={16}
                height={16}
                alt="Delete icon"
              />
              <h2 className="text-16 font-normal text-white-1">Delete</h2>
            </div>
          )} */}
      {/* </div>
      )} */}
    </div>
  );
};

export default NewsDetailPlayer;
