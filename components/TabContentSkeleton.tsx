"use client";

import { Skeleton } from "./ui/skeleton";
import NewsCardSkeleton from "./NewsCardSkeleton";

interface TabContentSkeletonProps {
  itemCount?: number;
  showHeader?: boolean;
}

export default function TabContentSkeleton({ 
  itemCount = 6,
  showHeader = true 
}: TabContentSkeletonProps) {
  return (
    <div className="w-full mt-4 animate-in fade-in-25 duration-500">
      {showHeader && (
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          
          <Skeleton className="h-10 w-32" />
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(itemCount).fill(0).map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}