import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of page numbers to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the start or end
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      // Add ellipsis if needed before middle pages
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed after middle pages
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full px-4 pt-8">
        <div className="p-4 border border-[#E6F5E6] rounded-md bg-white dark:bg-[#1A2A1F] shadow-sm dark:border-[#2D3D30]">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Showing {startItem} - {endItem} of {totalItems} entries
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={onItemsPerPageChange}
              >
                <SelectTrigger className="w-20 h-8 border-[#E6F5E6] dark:border-[#2D3D30] dark:bg-[#1A2A1F] dark:text-gray-200 dark:hover:bg-[#2D3D30]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#1A2A1F] dark:border-[#2D3D30]">
                  {[10, 25, 50, 100].map((size) => (
                    <SelectItem
                      key={size}
                      value={size.toString()}
                      className="dark:hover:bg-[#2D3D30] dark:focus:bg-[#2D3D30]"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 border-[#E6F5E6] dark:border-[#2D3D30] dark:text-gray-200 dark:hover:bg-[#2D3D30] dark:hover:text-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPageNumbers().map((page, index) =>
                typeof page === "number" ? (
                  <Button
                    key={index}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={`h-8 w-8 p-0 ${
                      currentPage === page
                        ? "bg-[#1B6131] hover:bg-[#46B749] dark:bg-[#46B749] dark:hover:bg-[#1B6131]"
                        : "border-[#E6F5E6] dark:border-[#2D3D30] dark:text-gray-200 dark:hover:bg-[#2D3D30]"
                    }`}
                  >
                    {page}
                  </Button>
                ) : (
                  <span
                    key={index}
                    className="mx-1 text-gray-500 dark:text-gray-400"
                  >
                    ...
                  </span>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 border-[#E6F5E6] dark:border-[#2D3D30] dark:text-gray-200 dark:hover:bg-[#2D3D30] dark:hover:text-gray-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Pagination;