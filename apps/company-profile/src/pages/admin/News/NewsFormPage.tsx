import React, { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { Loader2, ImagePlus, Save } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { MultiSelect } from "@/components/admin/MultiSelect";
import { Editor } from "@/components/admin/RichText";
import newsService, {
    CategoryResponse,
    TagResponse,
    CreateNewsData,
    UpdateNewsData,
    NewsResponse,
} from "@/services/newsService";
import { useParams } from "react-router-dom";
import { API_BASE_URL_COMPANY_PROFILE } from "@/config";

// Define form schema using zod
const formSchema = z.object({
    news_title: z.string().min(5, "Title must be at least 5 characters"),
    news_description: z.string().min(10, "Description must be at least 10 characters"),
    news_content: z.string().min(20, "Content must be at least 20 characters"),
    news_category_id: z.number({
        required_error: "Please select a category",
        invalid_type_error: "Category must be a number",
    }),
    news_is_published: z.boolean().default(false),
    tags: z.array(z.number()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Props interface for the component
interface NewsFormProps {
    onSuccess?: (news: NewsResponse) => void;
}

const NewsForm = ({ onSuccess }: NewsFormProps) => {
    const { newsId } = useParams<{ newsId: string }>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [tags, setTags] = useState<TagResponse[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: {
            news_title: "",
            news_description: "",
            news_content: "",
            news_category_id: 0,
            news_is_published: false,
            tags: [],
        },
    });

    // Fetch categories and tags on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [categoriesData, tagsData] = await Promise.all([
                    newsService.getCategories(),
                    newsService.getTags(),
                ]);
                setCategories(categoriesData);
                setTags(tagsData);

                // If editing, fetch news data
                if (newsId) {
                    const news = await newsService.getNewsById(parseInt(newsId, 10));

                    // Set form values for editing
                    form.reset({
                        news_title: news.news_title,
                        news_description: news.news_description,
                        news_content: news.news_content,
                        news_category_id: news.news_category_id,
                        news_is_published: news.news_is_published,
                        tags: news.tags.map(tag => tag.tag_id),
                    });

                    // Set image preview if exists
                    if (news.news_image_url) {
                        console.log(news.news_image_url);
                        // Handle relative URLs with base URL 
                        const imageUrl = news.news_image_url.startsWith('http')
                            ? news.news_image_url
                            : `${API_BASE_URL_COMPANY_PROFILE || ''}/${news.news_image_url}`;
                        setImagePreview(imageUrl);
                        console.log(imageUrl);
                        
                    }
                }
            } catch (err) {
                setError("Failed to load form data. Please try again.");
                console.error("Error fetching form data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [newsId, form]);

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // Create image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle image upload button click
    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    // Handle form submission
    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        setIsSubmitting(true);
        setError(null);

        try {
            let result: NewsResponse;

            if (newsId) {
                // Update existing news
                result = await newsService.updateNews(parseInt(newsId, 10), values as UpdateNewsData);
            } else {
                // Create new news
                result = await newsService.createNews(values as CreateNewsData);
            }

            // Upload image if selected
            if (imageFile && result) {
                result = await newsService.uploadNewsImage(result.news_id, imageFile);
            }

            // Call success callback if provided
            if (onSuccess) {
                onSuccess(result);
            }
        } catch (err: any) {
            setError(err.message || "Failed to save news item. Please try again.");
            console.error("Error submitting form:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
        );
    }

    return (
        <Card className="w-full shadow-md border border-border dark:border-sidebar-border">
            <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10">
                <CardTitle className="text-xl font-semibold text-primary-700 dark:text-primary-300">
                    {newsId ? "Edit News Item" : "Create News Item"}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="news_title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium">Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter news title"
                                            className="border-input focus:border-primary-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="news_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium">Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter a brief description"
                                            className="min-h-[100px] border-input focus:border-primary-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This will appear as a summary in news listings
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category */}
                        <FormField
                            control={form.control}
                            name="news_category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium">Category</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                        value={field.value?.toString()}
                                        defaultValue={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="border-input focus:border-primary-500">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.category_id}
                                                    value={category.category_id.toString()}
                                                >
                                                    {category.category_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tags */}
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium">Tags</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={tags.map(tag => ({
                                                value: tag.tag_id,
                                                label: tag.tag_name
                                            }))}
                                            selected={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Select tags"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Select one or more tags for better categorization
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Content Editor */}
                        <FormField
                            control={form.control}
                            name="news_content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium">Content</FormLabel>
                                    <FormControl>
                                        <Editor
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Write your news content here..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Featured Image */}
                        <div className="space-y-2">
                            <Label className="text-base font-medium">Featured Image</Label>
                            <div className="mt-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                />

                                {imagePreview ? (
                                    <div className="relative group">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-60 object-cover rounded-md border border-border dark:border-sidebar-border"
                                        />
                                        <div
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-md"
                                            onClick={handleImageClick}
                                        >
                                            <p className="text-white">Change Image</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={handleImageClick}
                                        className="w-full h-60 border-2 border-dashed rounded-md border-border dark:border-sidebar-border flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                                    >
                                        <ImagePlus className="w-12 h-12 text-muted-foreground" />
                                        <p className="mt-2 text-muted-foreground">
                                            Click to upload an image
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            JPG, PNG, WebP or GIF (max 5MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Published Status */}
                        <FormField
                            control={form.control}
                            name="news_is_published"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base font-medium">Published Status</FormLabel>
                                        <FormDescription>
                                            {field.value ? "This news is visible to the public" : "This news is saved as a draft"}
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-primary-600 data-[state=checked]:dark:bg-primary-500"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {newsId ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {newsId ? "Update News" : "Create News"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default NewsForm;