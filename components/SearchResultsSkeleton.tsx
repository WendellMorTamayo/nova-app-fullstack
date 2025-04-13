"use client";

import { Skeleton } from "./ui/skeleton";
import NewsCardSkeleton from "./NewsCardSkeleton";

export default function SearchResultsSkeleton() {
  return (
    <div className="w-full mt-4 animate-in fade-in-25 duration-300 relative">
      
      {/* Search Meta Info */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        
        {/* Search Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>
      
      {/* Results Count */}
      <div className="mb-6">
        <Skeleton className="h-5 w-48" />
      </div>
      
      {/* Search Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(9).fill(0).map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}