"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="w-full h-full animate-in fade-in-25">
      <div className="flex h-screen">
        {/* Left Sidebar Skeleton */}
        <div className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 p-4 h-screen">
          <div className="flex items-center justify-between w-full mb-6">
            <Skeleton className="h-14 w-36" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          <div className="flex flex-col gap-4 mt-8">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
          
          <div className="mt-auto">
            <Skeleton className="h-10 w-full rounded-lg mb-4" />
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden mb-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          {/* Search Bar */}
          <Skeleton className="h-12 w-full max-w-xl mb-8" />
          
          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="h-44 w-full rounded-lg mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-2/4" />
                <div className="flex items-center justify-between mt-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Sidebar Skeleton (only shown on certain pages) */}
        <div className="hidden lg:flex w-64 flex-col border-l border-gray-200 dark:border-gray-800 p-4 h-screen">
          <Skeleton className="h-12 w-full mb-6" />
          <div className="flex flex-col gap-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Player Skeleton at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black-1 p-2 flex items-center">
        <div className="flex items-center gap-3 w-full max-w-screen-2xl mx-auto">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}