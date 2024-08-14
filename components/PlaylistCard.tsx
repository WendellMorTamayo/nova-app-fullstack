import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const PlaylistCard = ({ playlistName, isNew, imgSrc }: any) => {
  const router = useRouter();
  const handleView = () => {
    if (isNew) {
      router.push("/create-playlist");
    }
  };
  return (
    <div className="cursor-pointer" onClick={handleView}>
      <figure className="flex flex-col gap-2">
        <Image
          src={imgSrc}
          width={174}
          height={174}
          alt={playlistName}
          className="aspect-square h-fit w-full rounded-xl 2xl:size-[250px]"
        />
        <div className="flex flex-col">
          <h1 className="text-16 truncate font-bold text-white-1">
            {playlistName}
          </h1>
        </div>
      </figure>
    </div>
  );
};

export default PlaylistCard;
