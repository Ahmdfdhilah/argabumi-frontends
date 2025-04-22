import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  User,
  Eye,
  Tag,
  Loader2,
  Edit,
  Trash2
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@workspace/ui/components/dialog";
import newsService, { NewsResponse } from "@/services/newsService";
import { API_BASE_URL_COMPANY_PROFILE } from "@/config";

const NewsDetails = () => {
  const { newsId, slug } = useParams();
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchNewsDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let newsData;

        if (newsId) {
          // Fetch by ID if available
          newsData = await newsService.getNewsById(parseInt(newsId, 10), true);
        } else if (slug) {
          // Otherwise fetch by slug
          newsData = await newsService.getNewsBySlug(slug, true);
        } else {
          throw new Error("News ID or slug is required");
        }

        setNews(newsData);
      } catch (err: any) {
        setError(err.message || "Failed to load news details");
        console.error("Error fetching news details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsDetails();
  }, [newsId, slug]);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      if (news) {
        await newsService.deleteNews(news.news_id);
        // Redirect to news list after successful deletion
        window.location.href = "/admin/news";
      } else {
        throw new Error("News data is not available");
      }
    } catch (err: any) {
      console.error("Error deleting news:", err);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;

    // Handle relative URLs with base URL
    return imageUrl.startsWith('http')
      ? imageUrl
      : `${API_BASE_URL_COMPANY_PROFILE || ''}/${imageUrl}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!news) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>News item not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card className="w-full shadow-md border border-border dark:border-sidebar-border">
        <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10 flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-semibold text-primary-700 dark:text-primary-300">
              {news.news_title}
            </CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                <Calendar className="h-3 w-3" />
                {news.created_at && format(new Date(news.created_at), "PPP")}
              </Badge>

              <Badge variant="outline" className="flex items-center gap-1 bg-accent/30 text-accent-foreground dark:bg-sidebar-accent/10">
                <User className="h-3 w-3" />
                {news.author?.user_first_name} {news.author?.user_last_name}
              </Badge>

              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {news.news_view_count} views
              </Badge>

              {news.category && (
                <Badge className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600">
                  {news.category.category_name}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Link to={`/admin/news/edit/${news.news_id}`}>
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardHeader>

        {news.news_image_url && (
          <div className="px-6 pt-6">
            <img
              src={getImageUrl(news.news_image_url) || undefined}
              alt={news.news_title}
              className="w-full h-auto object-cover rounded-md border border-border dark:border-sidebar-border"
            />
          </div>
        )}

        <CardContent className="p-6">
          <div className="mb-6 text-muted-foreground italic border-l-4 border-primary-200 dark:border-primary-800 pl-4 py-2">
            {news.news_description}
          </div>

          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: news.news_content }}
          />

          {news.tags && news.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-border dark:border-sidebar-border">
              <div className="flex flex-wrap gap-2 items-center">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {news.tags.map(tag => (
                  <Badge
                    key={tag.tag_id}
                    variant="secondary"
                    className="bg-secondary/20 hover:bg-secondary/30"
                  >
                    {tag.tag_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        </CardContent>

        <CardFooter className="bg-accent/10 dark:bg-sidebar-accent/5 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {news.news_is_published ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                Published
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                Draft
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Last updated: {news.updated_at && format(new Date(news.updated_at), "PPP p")}
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{news.news_title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewsDetails;