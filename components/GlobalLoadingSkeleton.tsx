"use client";

import { Skeleton } from "./ui/skeleton";

export function GlobalLoadingSkeleton() {
  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 dark:bg-black-3 z-50 animate-in fade-in-25 duration-300">
      <div className="flex h-screen">
        {/* Left Sidebar Skeleton */}
        <div className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-black-2">
          <div className="flex items-center justify-between w-full mb-8">
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          <div className="flex flex-col gap-5 mt-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
          
          <div className="mt-auto mb-6">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden mb-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          
          {/* Search Bar */}
          <Skeleton className="h-12 w-full max-w-xl mb-8" />
          
          {/* Hero Section */}
          <Skeleton className="h-20 w-3/4 max-w-3xl mb-6 rounded-lg" />
          <Skeleton className="h-4 w-1/2 max-w-2xl mb-12 rounded-md" />
          
          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="h-48 w-full rounded-lg mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center justify-between mt-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Sidebar Skeleton (only shown on news pages) */}
        <div className="hidden lg:flex w-64 flex-col border-l border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-black-2">
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
      <div className="fixed bottom-0 left-0 right-0 h-20 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black-2 p-4 flex items-center">
        <div className="flex items-center gap-3 w-full max-w-screen-2xl mx-auto">
          <Skeleton className="h-12 w-12 rounded-md" />
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