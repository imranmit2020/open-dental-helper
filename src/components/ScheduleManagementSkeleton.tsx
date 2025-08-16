import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ScheduleManagementSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Tabs skeleton */}
      <div>
        <div className="flex space-x-1 mb-6">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Tab content skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Add button skeleton */}
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>

              {/* Availability cards skeleton */}
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, clinicIndex) => (
                  <Card key={clinicIndex}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-6 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, scheduleIndex) => (
                          <div
                            key={scheduleIndex}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div>
                                <Skeleton className="h-4 w-16 mb-1" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                              <div>
                                <Skeleton className="h-4 w-32 mb-1" />
                                <Skeleton className="h-3 w-40" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-8 w-12" />
                              <Skeleton className="h-8 w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}