import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Loader2, Save } from "lucide-react";
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
import newsService, {
    CategoryResponse,
    CreateCategoryData,
    UpdateCategoryData,
} from "@/services/newsService";
import { useParams } from "react-router-dom";

// Define form schema using zod
const formSchema = z.object({
    category_name: z.string().min(3, "Category name must be at least 3 characters"),
    category_description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Props interface for the component
interface CategoryFormProps {
    onSuccess?: (category: CategoryResponse) => void;
}

const NewsCategoryForm = ({ onSuccess }: CategoryFormProps) => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category_name: "",
            category_description: "",
        },
    });

    // Fetch category data if editing
    useEffect(() => {
        const fetchCategory = async () => {
            if (!categoryId) return;
            
            setIsLoading(true);
            try {
                const category = await newsService.getCategoryById(parseInt(categoryId, 10));
                
                // Set form values for editing
                form.reset({
                    category_name: category.category_name,
                    category_description: category.category_description || "",
                });
            } catch (err) {
                setError("Failed to load category data. Please try again.");
                console.error("Error fetching category:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategory();
    }, [categoryId, form]);

    // Handle form submission
    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            let result: CategoryResponse;

            if (categoryId) {
                // Update existing category
                result = await newsService.updateCategory(parseInt(categoryId, 10), values as UpdateCategoryData);
            } else {
                // Create new category
                result = await newsService.createCategory(values as CreateCategoryData);
            }

            // Call success callback if provided
            if (onSuccess) {
                onSuccess(result);
            }
        } catch (err: any) {
            setError(err.message || "Failed to save category. Please try again.");
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
                    {categoryId ? "Edit Category" : "Create Category"}
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
                        {/* Category Name */}
                        <FormField
                            control={form.control}
                            name="category_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium">Category Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter category name"
                                            className="border-input focus:border-primary-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This name will be displayed in category listings and filters
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category Description */}
                        <FormField
                            control={form.control}
                            name="category_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium">Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter category description (optional)"
                                            className="min-h-[100px] border-input focus:border-primary-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Provide a brief description of what this category represents
                                    </FormDescription>
                                    <FormMessage />
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
                                        {categoryId ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {categoryId ? "Update Category" : "Create Category"}
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

export default NewsCategoryForm;