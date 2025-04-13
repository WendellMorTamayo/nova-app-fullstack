'use client';

import TabContentSkeleton from "@/components/TabContentSkeleton";

export default function CategoryLoading() {
  console.log("CategoryLoading component rendered"); // Debug log
  return (
    <div className="relative mt-4">
      <TabContentSkeleton itemCount={9} />
    </div>
  );
}