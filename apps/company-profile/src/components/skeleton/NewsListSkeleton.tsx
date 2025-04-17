import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

const NewsListSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(count).fill(0).map((_, index) => (
        <Card key={index} className="h-full overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 flex flex-col flex-grow">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-4/5 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <div className="mt-auto">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NewsListSkeleton;