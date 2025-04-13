import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="container mx-auto py-6 px-4">
      <Skeleton className="h-10 w-64 mb-8" />
      
      <div className="space-y-4 mb-8">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      
      {/* Main content area */}
      <Skeleton className="h-[500px] w-full rounded-lg" />
    </div>
  );
}