"use client";

import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";

export default function NewsCardSkeleton() {
  return (
    <Card className="w-full h-full border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="h-44 w-full" />
      </CardHeader>
      <CardContent className="pt-4 pb-2 px-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardFooter>
    </Card>
  );
}