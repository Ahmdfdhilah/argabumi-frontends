// src/services/newsService.ts
import cpApi from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export interface TagBase {
    tag_name: string;
}

export interface TagResponse extends TagBase {
    tag_id: number;
    tag_slug: string;
    created_at?: string;
    updated_at?: string;
}

export interface CategoryBase {
    category_name: string;
    category_description?: string | null;
}

export interface CategoryResponse extends CategoryBase {
    category_id: number;
    category_slug: string;
    created_at?: string;
    updated_at?: string;
}

export interface NewsBase {
    news_title: string;
    news_description: string;
    news_content: string;
    news_category_id: number;
    news_is_published: boolean;
}

export interface UserResponse {
    user_id: number;
    user_email: string;
    user_first_name: string;
    user_last_name: string;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}


export interface NewsResponse extends NewsBase {
    news_id: number;
    news_slug: string;
    news_image_url: string;
    news_author_id: number;
    news_published_at?: string | null;
    news_view_count: number;
    category: CategoryResponse;
    author: UserResponse;
    tags: TagResponse[];
    created_at?: string;
    updated_at?: string;
}

export interface NewsListResponse {
    items: NewsResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface CreateTagData {
    tag_name: string;
}

export interface UpdateTagData {
    tag_name?: string;
}

export interface CreateCategoryData {
    category_name: string;
    category_description?: string;
}

export interface UpdateCategoryData {
    category_name?: string;
    category_description?: string;
}

export interface CreateNewsData {
    news_title: string;
    news_description: string;
    news_content: string;
    news_category_id: number;
    news_is_published?: boolean;
    tags?: number[];
}

export interface UpdateNewsData {
    news_title?: string;
    news_description?: string;
    news_content?: string;
    news_category_id?: number;
    news_is_published?: boolean;
    tags?: number[];
}

export interface StatusMessage {
    status: string;
    message: string;
}

const { toast } = useToast();

export const newsService = {
    // News Items API methods
    getNews: async (
        page: number = 1,
        size: number = 10,
        search?: string,
        categoryId?: number,
        tagId?: number,
        authorId?: number,
        isPublished?: boolean,
        orderBy: string = "-created_at"
    ): Promise<NewsListResponse> => {
        try {
            const response = await cpApi.get("/news/", {
                params: {
                    page,
                    size,
                    search,
                    category_id: categoryId,
                    tag_id: tagId,
                    author_id: authorId,
                    is_published: isPublished,
                    order_by: orderBy,
                },
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch news items",
                variant: "destructive",
            });
            throw error;
        }
    },

    getNewsById: async (newsId: number, incrementViews: boolean = false): Promise<NewsResponse> => {
        try {
            // Updated path from /news/{newsId} to /news/item/{newsId}
            const response = await cpApi.get(`/news/item/${newsId}`, {
                params: { increment_views: incrementViews }
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch news item",
                variant: "destructive",
            });
            throw error;
        }
    },

    getNewsBySlug: async (slug: string, incrementViews: boolean = false): Promise<NewsResponse> => {
        try {
            const response = await cpApi.get(`/news/by-slug/${slug}`, {
                params: { increment_views: incrementViews }
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch news by slug",
                variant: "destructive",
            });
            throw error;
        }
    },

    createNews: async (newsData: CreateNewsData): Promise<NewsResponse> => {
        try {
            // Updated path from /news/item to /news/
            const response = await cpApi.post("/news/", newsData);
            toast({
                title: "Success",
                description: "News item created successfully",
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to create news item",
                variant: "destructive",
            });
            throw error;
        }
    },

    updateNews: async (newsId: number, newsData: UpdateNewsData): Promise<NewsResponse> => {
        try {
            // Updated path from /news/{newsId} to /news/item/{newsId}
            const response = await cpApi.put(`/news/item/${newsId}`, newsData);
            toast({
                title: "Success",
                description: "News item updated successfully",
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to update news item",
                variant: "destructive",
            });
            throw error;
        }
    },

    deleteNews: async (newsId: number): Promise<StatusMessage> => {
        try {
            // Updated path from /news/{newsId} to /news/item/{newsId}
            const response = await cpApi.delete(`/news/item/${newsId}`);
            toast({
                title: "Success",
                description: "News item deleted successfully",
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to delete news item",
                variant: "destructive",
            });
            throw error;
        }
    },

    uploadNewsImage: async (newsId: number, imageFile: File): Promise<NewsResponse> => {
        try {
            const formData = new FormData();
            formData.append("image", imageFile);

            // Updated path from /news/{newsId}/image to /news/item/{newsId}/image
            const response = await cpApi.post(`/news/item/${newsId}/image`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast({
                title: "Success",
                description: "News image uploaded successfully",
            });

            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to upload news image",
                variant: "destructive",
            });
            throw error;
        }
    },

    // Category API methods - no changes needed
    getCategories: async (
        skip: number = 0,
        limit: number = 100,
        search?: string
    ): Promise<CategoryResponse[]> => {
        try {
            const response = await cpApi.get("/news/categories", {
                params: { skip, limit, search },
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch categories",
                variant: "destructive",
            });
            throw error;
        }
    },

    getCategoryById: async (categoryId: number): Promise<CategoryResponse> => {
        try {
            const response = await cpApi.get(`/news/categories/${categoryId}`);
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch category",
                variant: "destructive",
            });
            throw error;
        }
    },

    getCategoryBySlug: async (slug: string): Promise<CategoryResponse> => {
        try {
            const response = await cpApi.get(`/news/categories/by-slug/${slug}`);
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch category by slug",
                variant: "destructive",
            });
            throw error;
        }
    },

    createCategory: async (categoryData: CreateCategoryData): Promise<CategoryResponse> => {
        try {
            const response = await cpApi.post("/news/categories", categoryData);
            toast({
                title: "Success",
                description: "Category created successfully",
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to create category",
                variant: "destructive",
            });
            throw error;
        }
    },

    updateCategory: async (categoryId: number, categoryData: UpdateCategoryData): Promise<CategoryResponse> => {
        try {
            const response = await cpApi.put(`/news/categories/${categoryId}`, categoryData);
            toast({
                title: "Success",
                description: "Category updated successfully",
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to update category",
                variant: "destructive",
            });
            throw error;
        }
    },

    deleteCategory: async (categoryId: number): Promise<StatusMessage> => {
        try {
            const response = await cpApi.delete(`/news/categories/${categoryId}`);
            toast({
                title: "Success",
                description: "Category deleted successfully",
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to delete category",
                variant: "destructive",
            });
            throw error;
        }
    },

    // Tag API methods - no changes needed
    getTags: async (
        skip: number = 0,
        limit: number = 100,
        search?: string
    ): Promise<TagResponse[]> => {
        try {
            const response = await cpApi.get("/news/tags", {
                params: { skip, limit, search },
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch tags",
                variant: "destructive",
            });
            throw error;
        }
    },

    getTagById: async (tagId: number): Promise<TagResponse> => {
        try {
            const response = await cpApi.get(`/news/tags/${tagId}`);
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to fetch tag",
                variant: "destructive",
            });
            throw error;
        }
    },

    createTag: async (tagData: CreateTagData): Promise<TagResponse> => {
        try {
            const response = await cpApi.post("/news/tags", tagData);
            toast({
                title: "Success",
                description: "Tag created successfully",
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to create tag",
                variant: "destructive",
            });
            throw error;
        }
    },

    updateTag: async (tagId: number, tagData: UpdateTagData): Promise<TagResponse> => {
        try {
            const response = await cpApi.put(`/news/tags/${tagId}`, tagData);
            toast({
                title: "Success",
                description: "Tag updated successfully",
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to update tag",
                variant: "destructive",
            });
            throw error;
        }
    },

    deleteTag: async (tagId: number): Promise<StatusMessage> => {
        try {
            const response = await cpApi.delete(`/news/tags/${tagId}`);
            toast({
                title: "Success",
                description: "Tag deleted successfully",
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to delete tag",
                variant: "destructive",
            });
            throw error;
        }
    }
};

export default newsService;