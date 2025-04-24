import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
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
    CreateTagData,
    UpdateTagData,
} from "@/services/newsService";
import { useNavigate, useParams } from "react-router-dom";

// Define form schema using zod
const formSchema = z.object({
    tag_name: z.string().min(2, "Tag name must be at least 2 characters"),
});

type FormValues = z.infer<typeof formSchema>;


const TagForm = () => {
    const { tagId } = useParams<{ tagId: string }>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tag_name: "",
        },
    });

    // Fetch tag data if editing
    useEffect(() => {
        const fetchTag = async () => {
            if (!tagId) return;

            setIsLoading(true);
            try {
                const tag = await newsService.getTagById(parseInt(tagId, 10));

                // Set form values for editing
                form.reset({
                    tag_name: tag.tag_name,
                });
            } catch (err) {
                setError("Failed to load tag data. Please try again.");
                console.error("Error fetching tag:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTag();
    }, [tagId, form]);

    // Handle form submission
    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {

            if (tagId) {
                // Update existing tag
                await newsService.updateTag(parseInt(tagId, 10), values as UpdateTagData);
            } else {
                // Create new tag
                await newsService.createTag(values as CreateTagData);
            }

            navigate('/admin/news/tags');
        } catch (err: any) {
            setError(err.message || "Failed to save tag. Please try again.");
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
                    {tagId ? "Edit Tag" : "Create Tag"}
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
                        {/* Tag Name */}
                        <FormField
                            control={form.control}
                            name="tag_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium">Tag Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter tag name"
                                            className="border-input focus:border-primary-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This name will be displayed in tag listings and can be used to filter news items
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
                                        {tagId ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {tagId ? "Update Tag" : "Create Tag"}
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

export default TagForm;