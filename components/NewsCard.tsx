"use client";
import { api } from "@/convex/_generated/api";
import { newsCardProps } from "@/types";
import { useMutation } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingOverlay } from "./LoadingOverlay";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";

const NewsCard = ({
  imgUrl,
  title,
  description,
  newsId,
  views = 0, // Provide default value
  source,
}: newsCardProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setIsLoading: setGlobalLoading } = useGlobalLoading();
  
  const updateViews = useMutation(api.news.updateViews);
  const addToRecent = useMutation(api.news.addToRecents);
  
  const handleViews = async () => {
    try {
      // Show loading state
      setIsLoading(true);
      
      // First update in background
      await Promise.all([
        addToRecent({ newsId }),
        updateViews({ newsId, views: views || 0 })
      ]);
      
      // Navigate to the news page
      router.push(`/news/${newsId}`, { scroll: true });
    } catch (error) {
      console.error("Error navigating to news:", error);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="cursor-pointer relative" onClick={handleViews}>
      {isLoading && <LoadingOverlay isLoading={isLoading} transparent />}
      <figure className="flex flex-col gap-2">
        <Image
          src={imgUrl}
          width={174}
          height={174}
          alt={title}
          className="aspect-square h-fit w-full rounded-xl 2xl:size-[250px]"
        />
        <div className="flex flex-col">
          <h1 className="text-16 truncate font-bold text-white-1">{title}</h1>
          <div className="flex flex-col">
            <h2 className="text-12 truncate font-normal capitalize text-white-4">
              {description}
            </h2>
            {source && (
              <span className="text-10 font-medium text-gray-400">
                Source: {source}
              </span>
            )}
          </div>
        </div>
      </figure>
    </div>
  );
};

export default NewsCard;
