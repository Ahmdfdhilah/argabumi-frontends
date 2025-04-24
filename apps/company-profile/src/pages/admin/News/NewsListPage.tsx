import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, Loader2, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@workspace/ui/components/alert-dialog";
import { useNavigate } from "react-router-dom";
import newsService, { NewsListResponse, CategoryResponse, TagResponse } from "@/services/newsService";
import Pagination from "@/components/admin/Pagination";
import Filtering from "@/components/admin/Filtering";
import { API_BASE_URL_COMPANY_PROFILE } from "@/config";

const NewsList: React.FC = () => {
  const navigate = useNavigate();
  // State for news data
  const [newsData, setNewsData] = useState<NewsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [publishedStatus, setPublishedStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("-created_at");
  
  // State for filter options
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  
  // State for deletion confirmation
  const [newsToDelete, setNewsToDelete] = useState<number | null>(null);

  // State for fullscreen image preview
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Fetch news on mount and when filters or pagination change
  useEffect(() => {
    fetchNewsData();
    fetchFilterOptions();
  }, [currentPage, itemsPerPage, searchQuery, selectedCategory, selectedTag, publishedStatus, sortOrder]);

  // Fetch news data
  const fetchNewsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const isPublished = publishedStatus === "all" 
        ? undefined 
        : publishedStatus === "published";
      
      const response = await newsService.getNews(
        currentPage,
        itemsPerPage,
        searchQuery,
        selectedCategory || undefined,
        selectedTag || undefined,
        undefined, // author ID - not filtering by this
        isPublished,
        sortOrder
      );
      
      setNewsData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch news data");
      console.error("Error fetching news data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch filter options (categories and tags)
  const fetchFilterOptions = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        newsService.getCategories(),
        newsService.getTags()
      ]);
      
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value, 10));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : parseInt(value, 10));
    setCurrentPage(1);
  };

  // Handle tag filter change
  const handleTagChange = (value: string) => {
    setSelectedTag(value === "all" ? null : parseInt(value, 10));
    setCurrentPage(1);
  };

  // Handle published status filter change
  const handlePublishedStatusChange = (value: string) => {
    setPublishedStatus(value);
    setCurrentPage(1);
  };

  // Handle sort order change
  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  // Handle delete news item
  const handleDeleteNews = async () => {
    if (!newsToDelete) return;
    
    try {
      await newsService.deleteNews(newsToDelete);
      fetchNewsData(); // Refresh the list after deleting
      setNewsToDelete(null);
    } catch (err) {
      console.error("Error deleting news item:", err);
    }
  };

  // Handle creating a new news item
  const handleCreateNews = () => {
    navigate("/admin/news/create");
  };

  // Handle editing a news item
  const handleEditNews = (newsId: number) => {
    navigate(`/admin/news/edit/${newsId}`);
  };

  // Handle viewing a news item
  const handleViewNews = (newsId: number) => {
    navigate(`/admin/news/details/${newsId}`);
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  // Get status badge component
  const getStatusBadge = (isPublished: boolean, publishedAt?: string | null) => {
    if (isPublished) {
      return (
        <Badge className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600">
          Published at {publishedAt ? formatDate(publishedAt) : "N/A"}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-600 dark:text-gray-300 border-border dark:border-sidebar-border">
          Draft
        </Badge>
      );
    }
  };

  // Handle image click for fullscreen preview
  const handleImageClick = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
  };

  // Handle closing fullscreen preview
  const closeFullscreenPreview = () => {
    setFullscreenImage(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with title and create button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          News Management
        </h1>
        <Button 
          onClick={handleCreateNews}
          className="mt-4 sm:mt-0 bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create News
        </Button>
      </div>

      {/* Search and filter section */}
      <div className="w-full space-y-6">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search news by title or description"
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 border-input focus:border-primary-500"
          />
        </div>

        {/* Filters */}
        <Filtering>
          {/* Category filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <Select value={selectedCategory?.toString() || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="border-input focus:border-primary-500">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.category_id} value={category.category_id.toString()}>
                    {category.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tag filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tag</label>
            <Select value={selectedTag?.toString() || "all"} onValueChange={handleTagChange}>
              <SelectTrigger className="border-input focus:border-primary-500">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.tag_id} value={tag.tag_id.toString()}>
                    {tag.tag_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Published status filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <Select value={publishedStatus} onValueChange={handlePublishedStatusChange}>
              <SelectTrigger className="border-input focus:border-primary-500">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort order filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
            <Select value={sortOrder} onValueChange={handleSortOrderChange}>
              <SelectTrigger className="border-input focus:border-primary-500">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="-created_at">Newest First</SelectItem>
                <SelectItem value="created_at">Oldest First</SelectItem>
                <SelectItem value="news_title">Title (A-Z)</SelectItem>
                <SelectItem value="-news_title">Title (Z-A)</SelectItem>
                <SelectItem value="-news_view_count">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Filtering>
      </div>

      {/* News list */}
      <Card className="w-full shadow-md border border-border dark:border-sidebar-border">
        <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10">
          <CardTitle className="text-xl font-semibold text-primary-700 dark:text-primary-300">
            News List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <Button 
                onClick={fetchNewsData} 
                variant="outline" 
                className="mt-4 border-border dark:border-sidebar-border text-primary-600 dark:text-primary-400"
              >
                Retry
              </Button>
            </div>
          ) : newsData && newsData.items.length > 0 ? (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-md font-medium text-white  uppercase tracking-wider">
                      Title
                    </TableHead>
                    <TableHead className="text-md font-medium text-white  uppercase tracking-wider">
                      Category
                    </TableHead>
                    <TableHead className="text-md font-medium text-white uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-md font-medium text-white uppercase tracking-wider">
                      Author
                    </TableHead>
                    <TableHead className="text-md font-medium text-white uppercase tracking-wider">
                      Created
                    </TableHead>
                    <TableHead className="text-md font-medium text-white uppercase tracking-wider">
                      Views
                    </TableHead>
                    <TableHead className="text-right text-md font-medium text-white uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsData.items.map((news) => (
                    <TableRow key={news.news_id} className="hover:bg-accent/10 dark:hover:bg-sidebar-accent/5">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          {news.news_image_url && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3 cursor-pointer">
                              <img 
                                src={news.news_image_url.startsWith('http') ? news.news_image_url : `${API_BASE_URL_COMPANY_PROFILE || ''}/${news.news_image_url}`} 
                                alt={news.news_title}
                                className="h-10 w-10 rounded-md object-cover hover:opacity-80 transition-opacity"
                                onClick={() => handleImageClick(news.news_image_url.startsWith('http') ? news.news_image_url : `${API_BASE_URL_COMPANY_PROFILE || ''}/${news.news_image_url}`)}
                              />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 max-w-xs">
                            {news.news_title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {news.category.category_name}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStatusBadge(news.news_is_published, news.news_published_at)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {news.author.user_first_name} {news.author.user_last_name}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(news.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {news.news_view_count.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-border dark:border-sidebar-border hover:bg-accent/10 dark:hover:bg-sidebar-accent/5"
                            >
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-border dark:border-sidebar-border bg-background">
                            <DropdownMenuItem 
                              onClick={() => handleViewNews(news.news_id)}
                              className="hover:bg-accent/10 dark:hover:bg-sidebar-accent/5 text-gray-700 dark:text-gray-300"
                            >
                              <Eye className="mr-2 h-4 w-4 text-primary-600 dark:text-primary-400" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditNews(news.news_id)}
                              className="hover:bg-accent/10 dark:hover:bg-sidebar-accent/5 text-gray-700 dark:text-gray-300"
                            >
                              <Edit className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border dark:bg-sidebar-border" />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setNewsToDelete(news.news_id);
                                  }}
                                  className="hover:bg-accent/10 dark:hover:bg-sidebar-accent/5 text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-background border-border dark:border-sidebar-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                    This action cannot be undone. This will permanently delete the news item.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-border dark:border-sidebar-border hover:bg-accent/10 dark:hover:bg-sidebar-accent/5 text-gray-700 dark:text-gray-300">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteNews}
                                    className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No news items found.</p>
              <Button
                onClick={handleCreateNews}
                className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First News
              </Button>
            </div>
          )}
        </CardContent>
        
        {newsData && newsData.items.length > 0 && (
          <CardFooter className="p-0 pb-8">
            <Pagination
              currentPage={currentPage}
              totalPages={newsData.pages}
              itemsPerPage={itemsPerPage}
              totalItems={newsData.total}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </CardFooter>
        )}
      </Card>

      {/* Fullscreen Image Preview */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeFullscreenPreview}
        >
          <div className="relative max-w-5xl max-h-screen">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={closeFullscreenPreview}
            >
              <X className="h-6 w-6" />
            </Button>
            <img 
              src={fullscreenImage} 
              alt="Fullscreen preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsList;