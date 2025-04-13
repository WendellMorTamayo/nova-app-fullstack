"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function NewsDetailSkeleton() {
  return (
    <section className="flex w-full flex-col">
      {/* Header */}
      <header className="mt-9 flex items-center justify-between">
        <Skeleton className="h-10 w-52" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-12" />
        </div>
      </header>

      {/* News Player Area */}
      <div className="mt-6 flex w-full justify-between max-md:justify-center">
        <div className="flex flex-col gap-8 max-md:items-center md:flex-row">
          <Skeleton className="aspect-square h-[250px] w-[250px] rounded-lg" />
          <div className="flex w-full flex-col gap-5 max-md:items-center md:gap-9">
            <article className="flex flex-col gap-2 max-md:items-center">
              <Skeleton className="h-8 w-full max-w-md" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-36 mt-2" />
            </article>
            <Skeleton className="h-10 w-full max-w-[250px] rounded-md" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="pt-[45px] pb-8">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Transcription */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Similar News */}
      <div className="mt-8 flex flex-col gap-5">
        <Skeleton className="h-6 w-40" />
        <div className="podcast_grid">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="aspect-square h-[174px] w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}