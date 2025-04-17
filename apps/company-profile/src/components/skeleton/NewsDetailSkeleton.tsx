import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";

const NewsDetailSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="aspect-video w-full" />
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-4/5" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-3 mt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="pt-4">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>  
      </CardContent>
    </Card>
  );
};

export default NewsDetailSkeleton;