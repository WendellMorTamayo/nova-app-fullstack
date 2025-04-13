/* eslint-disable no-unused-vars */

import { Dispatch, SetStateAction } from "react";

import { Id } from "@/convex/_generated/dataModel";

export interface EmptyStateProps {
  title: string;
  search?: boolean;
  buttonText?: string;
  buttonLink?: string;
  description?: string;
}

export interface TopUsersProps {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  imageUrl: string;
  clerkId: string;
  name: string;
  news: {
    newsTitle: string;
    newsId: Id<"news">;
  }[];
  totalNews: number;
}

export interface NewsProps {
  _id: Id<"news">;
  _creationTime: number;
  audioStorageId: Id<"_storage"> | null;
  user: Id<"users">;
  newsTitle: string;
  newsDescription: string;
  audioUrl: string | null;
  imageUrl: string | null;
  imageStorageId: Id<"_storage"> | null;
  author: string;
  authorId: string;
  authorImageUrl: string;
  voicePrompt: string;
  imagePrompt: string | null;
  voiceType: string;
  audioDuration: number;
  views: number;
  source?: string;
}

export interface ProfileNewsProps {
  news: NewsProps[];
  listeners: number;
}

export interface GenerateNewsProps {
  voiceType: string;
  newsType: string;
  setAudio: Dispatch<SetStateAction<string>>;
  audio: string;
  setAudioStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  voicePrompt: string;
  setVoicePrompt: Dispatch<SetStateAction<string>>;
  setAudioDuration: Dispatch<SetStateAction<number>>;
  setNewsType: Dispatch<SetStateAction<string>>;
}

export interface GenerateThumbnailProps {
  setImage: Dispatch<SetStateAction<string>>;
  setImageStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  image: string;
  imagePrompt: string;
  setImagePrompt: Dispatch<SetStateAction<string>>;
}

export interface LatestNewsCardProps {
  imgUrl: string;
  title: string;
  duration: string;
  index: number;
  audioUrl: string;
  author: string;
  views: number;
  newsId: Id<"news">;
}

export interface newsDetailPlayerProps {
  audioUrl: string;
  newsTitle: string;
  author: string;
  // isOwner: boolean;
  imageUrl: string;
  newsId: Id<"news">;
  imageStorageId: Id<"_storage">;
  audioStorageId: Id<"_storage">;
  authorImageUrl: string;
  authorId: string;
  voiceType: string;
  source?: string;
}

export interface AudioProps {
  title: string;
  audioUrl: string;
  author: string;
  imageUrl: string;
  newsId: Id<"news">;
  source?: string;
}

export interface AudioContextType {
  audio: AudioProps | undefined;
  setAudio: React.Dispatch<React.SetStateAction<AudioProps | undefined>>;
}

export interface newsCardProps {
  imgUrl: string;
  title: string;
  description: string;
  newsId: Id<"news">;
  views?: number; // Make views optional
  source?: string;
}

export interface CarouselProps {
  fansLikeDetail: TopUsersProps[];
}

export interface ProfileCardProps {
  newsData: ProfileNewsProps;
  imageUrl: string;
  userFirstName: string;
}

export type UseDotButtonType = {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
};