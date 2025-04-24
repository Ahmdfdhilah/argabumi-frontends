import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
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
import newsService, { CategoryResponse } from "@/services/newsService";
import Pagination from "@/components/admin/Pagination";
import Filtering from "@/components/admin/Filtering";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

const NewsCategoryList: React.FC = () => {
  const navigate = useNavigate();
  // State for category data
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("-created_at");
  
  // State for deletion confirmation
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  // Fetch categories on mount and when filters or pagination change
  useEffect(() => {
    fetchCategories();
  }, [sortOrder]);

  // Fetch category data
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await newsService.getCategories(0, 100, ""); // Fetch all categories
      setCategories(response);
      applyFiltersAndPagination(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch categories");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters and pagination to the fetched categories
  useEffect(() => {
    applyFiltersAndPagination(categories);
  }, [searchQuery, currentPage, itemsPerPage, sortOrder]);

  const applyFiltersAndPagination = (categoriesData: CategoryResponse[]) => {
    // Apply search filter
    let filtered = categoriesData;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = categoriesData.filter(
        category => 
          category.category_name.toLowerCase().includes(query) || 
          (category.category_description && category.category_description.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const isDesc = sortOrder.startsWith("-");
      const field = isDesc ? sortOrder.substring(1) : sortOrder;
      
      switch (field) {
        case "created_at":
          return isDesc 
            ? new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
            : new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime();
        case "category_name":
          return isDesc
            ? b.category_name.localeCompare(a.category_name)
            : a.category_name.localeCompare(b.category_name);
        default:
          return 0;
      }
    });

    // Update total count
    setTotalItems(filtered.length);
    
    // Apply pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setFilteredCategories(filtered.slice(start, end));
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

  // Handle sort order change
  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await newsService.deleteCategory(categoryToDelete);
      fetchCategories(); // Refresh the list after deleting
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  // Handle creating a new category
  const handleCreateCategory = () => {
    navigate("/admin/news/categories/create");
  };

  // Handle editing a category
  const handleEditCategory = (categoryId: number) => {
    navigate(`/admin/news/categories/edit/${categoryId}`);
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with title and create button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Category Management
        </h1>
        <Button 
          onClick={handleCreateCategory}
          className="mt-4 sm:mt-0 bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>

      {/* Search and filter section */}
      <div className="w-full space-y-6">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search categories by name or description"
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 border-input focus:border-primary-500"
          />
        </div>

        {/* Filters */}
        <Filtering>
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
                <SelectItem value="category_name">Name (A-Z)</SelectItem>
                <SelectItem value="-category_name">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Filtering>
      </div>

      {/* Category list */}
      <Card className="w-full shadow-md border border-border dark:border-sidebar-border">
        <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10">
          <CardTitle className="text-xl font-semibold text-primary-700 dark:text-primary-300">
            Categories List
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
                onClick={fetchCategories} 
                variant="outline" 
                className="mt-4 border-border dark:border-sidebar-border text-primary-600 dark:text-primary-400"
              >
                Retry
              </Button>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-md font-medium text-white uppercase tracking-wider">
                      Name
                    </TableHead>
                    <TableHead className="text-md font-medium text-white uppercase tracking-wider">
                      Description
                    </TableHead>
                    <TableHead className="text-md font-medium text-white uppercase tracking-wider">
                      Slug
                    </TableHead>
                    <TableHead className="text-md font-medium text-white uppercase tracking-wider">
                      Created
                    </TableHead>
                    <TableHead className="text-right text-md font-medium text-white uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.category_id} className="hover:bg-accent/10 dark:hover:bg-sidebar-accent/5">
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {category.category_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 max-w-xs">
                          {category.category_description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {category.category_slug}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(category.created_at)}
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
                              onClick={() => handleEditCategory(category.category_id)}
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
                                    setCategoryToDelete(category.category_id);
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
                                    This action cannot be undone. This will permanently delete the category and may affect news items associated with it.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-border dark:border-sidebar-border hover:bg-accent/10 dark:hover:bg-sidebar-accent/5 text-gray-700 dark:text-gray-300">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteCategory}
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
              <p className="text-gray-500 dark:text-gray-400 mb-4">No categories found.</p>
              <Button
                onClick={handleCreateCategory}
                className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Category
              </Button>
            </div>
          )}
        </CardContent>
        
        {filteredCategories.length > 0 && (
          <CardFooter className="p-0 pb-8">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default NewsCategoryList;