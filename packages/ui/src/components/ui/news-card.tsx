import { Card, CardContent } from "@workspace/ui/components/card";
import { ChevronRight } from "lucide-react";
import { Link } from 'react-router-dom';
import { cn } from "@workspace/ui/lib/utils";

export interface NewsCardProps {
  news: any;
  className?: string;
  isCompact?: boolean;
}

export const NewsCard = ({ 
  news, 
  className,
  isCompact = false
}: NewsCardProps) => {
  return (
    <Card className={cn("h-full overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1", className)}>
      <CardContent className="p-0 h-full flex flex-col">
        {news.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-full object-cover"
            />
            {news.category && (
              <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                {news.category}
              </span>
            )}
          </div>
        )}
        <div className="p-4 flex flex-col flex-grow">
          {news.date && (
            <p className="text-sm text-gray-500 mb-2">{news.date}</p>
          )}
          <h3 className={cn("font-bold mb-2", isCompact ? "text-base line-clamp-1" : "text-lg line-clamp-2")}>
            {news.title}
          </h3>
          <p className={cn("text-gray-600 mb-4", isCompact ? "line-clamp-2" : "line-clamp-3")}>
            {news.description}
          </p>
          <div className="mt-auto">
            <Link
              to={`/news/${news.id}`}
              className="text-primary font-medium hover:underline inline-flex items-center"
            >
              Read More
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;