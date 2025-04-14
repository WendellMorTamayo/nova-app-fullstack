"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CreateNewsLoading = () => {
  return (
    <section className="mt-10 flex flex-col animate-in fade-in-5 duration-500">
      <Skeleton className="h-8 w-64 mb-12" />
      
      <div className="flex flex-col gap-[30px] border-b border-black-5 dark:border-black-5 pb-10">
        {/* Title Field */}
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-6 w-20 mb-1" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Voice Type Selector */}
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-6 w-32 mb-1" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Description Field */}
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-6 w-28 mb-1" />
          <Skeleton className="h-28 w-full" />
        </div>
        
        {/* Source Field */}
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-6 w-36 mb-1" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
      
      <div className="flex flex-col pt-10 gap-8">
        {/* Generate News Section */}
        <div>
          <Skeleton className="h-6 w-56 mb-3" />
          <Skeleton className="h-36 w-full mb-4" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        {/* Generate Thumbnail Section */}
        <div className="mt-5">
          <Skeleton className="h-14 w-full max-w-[520px] mb-4" />
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        {/* Submit Button */}
        <div className="mt-5">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </section>
  );
};

export default CreateNewsLoading;