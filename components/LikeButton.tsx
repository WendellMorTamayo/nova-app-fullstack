"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export function AddToLikesButton({ newsId }: any) {
  const { pending } = useFormStatus();
  const likesResponse = useQuery(api.news.getLikesByNewsId, { newsId: newsId });
  const addToLikes = useMutation(api.news.addToLikes);
  const removeFromLikes = useMutation(api.news.removeFromLikes);
  const [isLiked, setIsLiked] = useState(false);
  
  useEffect(() => {
    // Handle different response formats
    if (likesResponse) {
      // New format (object with likes array and status)
      if (likesResponse.likes) {
        setIsLiked(likesResponse.likes.length > 0);
      } 
      // Legacy format (array)
      else if (Array.isArray(likesResponse)) {
        setIsLiked(likesResponse.length > 0);
      }
      // Default to not liked if format is unknown
      else {
        setIsLiked(false);
      }
    }
  }, [likesResponse]);

  const handleClick = () => {
    if (!isLiked) {
      addToLikes({ newsId: newsId });
      setIsLiked(true);
    } else {
      // Handle both response formats
      const likeId = likesResponse?.likes?.[0]?._id || 
                    (Array.isArray(likesResponse) ? likesResponse[0]?._id : null);
      
      if (likeId) {
        removeFromLikes({ newsId: likeId });
        setIsLiked(false);
      }
    }
  };

  return (
    <>
      {pending ? (
        <Button variant="ghost" size="icon" disabled className="bg-transparent">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="bg-transparent hover:bg-transparent hover:scale-110 transition-transform duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={!isLiked ? "#0E0202A3" : "#E21C49"}
            stroke="white"
            strokeWidth={1}
            className="w-6 h-6 bg-transparent"
            onClick={handleClick}
          >
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
        </Button>
      )}
    </>
  );
}

export function DeleteFromLikesButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button variant="ghost" size="icon" disabled className="bg-transparent">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="bg-transparent hover:bg-transparent hover:scale-110 transition-transform duration-300"
          type="submit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={"#5C67DE"}
            stroke="white"
            strokeWidth={1}
            className="w-6 h-6 bg-transparent"
          >
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
        </Button>
      )}
    </>
  );
}
