import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { NewsCard } from "@workspace/ui/components/ui/news-card";
import { Skeleton } from "@workspace/ui/components/skeleton";

const RecentNewsSidebar = ({ recentNews, isLoading }: { recentNews: any[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary-500">Berita Terkini</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="flex gap-2">
              <Skeleton className="w-20 h-16 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary-500">Berita Terkini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentNews.slice(0, 4).map((news) => (
          <NewsCard key={news.id} news={news} isCompact />
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentNewsSidebar;