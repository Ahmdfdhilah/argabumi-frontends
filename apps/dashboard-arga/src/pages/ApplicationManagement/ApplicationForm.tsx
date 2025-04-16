import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Application, applicationService } from '@/services/applicationService';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@workspace/ui/components/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@workspace/ui/components/textarea';
import Loader from '@workspace/ui/components/ui/loading';

// Form schema
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  code: z.string().min(2, "Code must be at least 2 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Code must contain only letters, numbers, underscores, and hyphens"),
  description: z.string().optional(),
  base_url: z.string().url("Must be a valid URL")
});

type FormValues = z.infer<typeof formSchema>;

const ApplicationForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const isEditing = Boolean(id);

  // React Hook Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      base_url: ''
    }
  });

  // Fetch application data if editing
  useEffect(() => {
    const fetchApplication = async () => {
      if (!isEditing || !id) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await applicationService.fetchApplicationById(Number(id));
        setApplication(data);
        // Populate form fields with the application data
        form.reset({
          name: data.name,
          code: data.code,
          description: data.description || '',
          base_url: data.base_url
        });
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Failed to fetch application details');
        console.error('Error fetching application:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();

    return () => {
      setApplication(null);
    };
  }, [id, isEditing, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      if (isEditing && id) {
        // Update existing application
        const updatedApplication = await applicationService.updateApplication(Number(id), values);
        setApplication(updatedApplication);
        navigate(`/application-management/detail/${id}`);
      } else {
        // Create new application
        const newApplication = await applicationService.createApplication({
          ...values,
          description: values.description || null
        });
        navigate(`/application-management/detail/${newApplication.id}`);
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : `Failed to ${isEditing ? 'update' : 'create'} application`);
      console.error(`Error ${isEditing ? 'updating' : 'creating'} application:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing && !application) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        onClick={() => navigate('/application-management')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Applications
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Application' : 'Create New Application'}</CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Update the details of your application.' 
              : 'Fill out the form below to create a new application.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Application name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of your application that will be displayed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="app-code" 
                        {...field} 
                        disabled={isEditing} // Code should not be editable when updating
                      />
                    </FormControl>
                    <FormDescription>
                      A unique identifier for your application. Once set, it cannot be changed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your application (optional)" 
                        className="resize-y min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of what your application does.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="base_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The base URL where your application is hosted.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-end gap-2 px-0 pb-0 pt-6">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => navigate('/application-management')}
                  disabled={form.formState.isSubmitting || loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={form.formState.isSubmitting || loading || !form.formState.isDirty}
                >
                  {form.formState.isSubmitting || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? 'Update' : 'Create'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationForm;