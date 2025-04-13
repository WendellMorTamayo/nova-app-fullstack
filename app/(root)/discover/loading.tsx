'use client';

import SearchResultsSkeleton from "@/components/SearchResultsSkeleton";

export default function DiscoverLoading() {
  console.log("DiscoverLoading component rendered"); // Debug log to verify loading state
  return (
    <div className="relative mt-6">
      <SearchResultsSkeleton />
      {/* This comment will help us verify the loading component is properly rendered */}
    </div>
  );
}