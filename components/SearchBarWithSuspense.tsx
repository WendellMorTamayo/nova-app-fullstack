"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the SearchBar with no SSR
const SearchBar = dynamic(() => import('./SearchBar'), {
  ssr: false,
});

// Skeleton loader for the SearchBar
const SearchBarSkeleton = () => (
  <div className="mt-8 flex flex-col">
    <div className="flex items-center space-x-4">
      <div className="h-14 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>
      <div className="h-14 w-14 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>
    </div>
  </div>
);

const SearchBarWithSuspense = () => {
  return (
    <Suspense fallback={<SearchBarSkeleton />}>
      <SearchBar />
    </Suspense>
  );
};

export default SearchBarWithSuspense;