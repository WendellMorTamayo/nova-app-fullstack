import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionLoading() {
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8 animate-in fade-in-25 duration-500">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-64 mx-auto mb-3" />
        <Skeleton className="h-4 w-full max-w-md mx-auto" />
      </div>
      
      <div className="grid gap-8 md:grid-cols-3 md:gap-12 mx-auto max-w-4xl">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex flex-col p-6 border rounded-lg">
            <Skeleton className="h-7 w-24 mb-2" />
            <Skeleton className="h-12 w-full mb-4" />
            
            <div className="space-y-3 mb-6">
              {Array(4).fill(0).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
            
            <div className="mt-auto">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}