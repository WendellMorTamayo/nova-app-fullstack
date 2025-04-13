'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function NewsDetailLoading() {
  console.log("NewsDetailLoading component rendered"); // Debug log
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 relative">
      {/* Indicator label for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 right-0 bg-purple-500 text-white px-2 py-1 text-xs rounded z-50">
          NEWS DETAIL SKELETON LOADING
        </div>
      )}
      
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4 md:w-1/2" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        
        {/* Comments/Related */}
        <div className="pt-6 border-t">
          <Skeleton className="h-6 w-40 mb-4" />
          
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}