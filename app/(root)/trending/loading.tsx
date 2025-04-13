'use client';

import TabContentSkeleton from "@/components/TabContentSkeleton";

export default function TrendingLoading() {
  return (
    <div className="relative mt-4">
      <TabContentSkeleton itemCount={9} />
    </div>
  );
}