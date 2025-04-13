"use client";

import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import NewsCardSkeleton from "./NewsCardSkeleton";

export default function ProfileSkeleton() {
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8 animate-in fade-in-25 duration-500">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
        <Skeleton className="h-24 w-24 rounded-full" />
        
        <div className="flex-1">
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
            
            <div className="flex flex-wrap gap-3 mt-3">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-8">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full max-w-md mb-8 grid grid-cols-3">
            <TabsTrigger value="posts" disabled>
              <Skeleton className="h-5 w-16" />
            </TabsTrigger>
            <TabsTrigger value="likes" disabled>
              <Skeleton className="h-5 w-16" />
            </TabsTrigger>
            <TabsTrigger value="playlists" disabled>
              <Skeleton className="h-5 w-16" />
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        </Tabs>
      </div>
      
      {/* Stats Section */}
      <div className="mt-12 border-t pt-8">
        <Skeleton className="h-6 w-32 mb-4" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}