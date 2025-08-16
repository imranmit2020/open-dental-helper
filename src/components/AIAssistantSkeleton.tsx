import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AIAssistantSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-none">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Quick query buttons skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-auto p-3 flex flex-col items-center gap-2 border rounded-md">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Chat area skeleton */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-none">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Empty state skeleton */}
          <div className="flex-1 p-4">
            <div className="text-center py-12">
              <Skeleton className="w-20 h-20 mx-auto mb-6 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-4 w-80 mx-auto" />
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Input area skeleton */}
          <div className="p-6 bg-background/50 backdrop-blur-sm border-t">
            {/* Query type selector skeleton */}
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            
            {/* Input field skeleton */}
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-12" />
              <Skeleton className="h-12 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}