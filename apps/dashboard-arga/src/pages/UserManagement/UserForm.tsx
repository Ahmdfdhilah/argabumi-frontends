// src/pages/UserManagement/UserForm.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  userService
} from '@/services/userService';
import {
  Application,
  applicationService
} from '@/services/applicationService';

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
import { Switch } from '@workspace/ui/components/switch';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Checkbox } from '@workspace/ui/components/checkbox';
import Loader from '@workspace/ui/components/ui/loading';

// Define schema making required fields non-optional
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().optional(),
  is_active: z.boolean().default(true),
  applications: z.array(z.number()).default([])
});

// Type definition from the schema
type FormValues = z.infer<typeof formSchema>;

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      is_active: true,
      applications: []
    }
  });

  const fetchUserData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const userData = await userService.getUserById(parseInt(id));
      setUser(userData);
      // Populate form with user data
      form.reset({
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name || "",
        is_active: userData.is_active,
        applications: userData.applications.map((app: { id: any; }) => app.id)
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      fetchUserData();
    }
  }, [id, isEditing]);

  const fetchApplications = async () => {
    setLoading(true);
    // setError(null);
    try {
      const data = await applicationService.fetchApplications();
      setApplications(data);
    } catch (err) {
      // setError(typeof err === 'string' ? err : 'Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);
  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      if (isEditing && id) {
        // Update user
        const updatedUser = await userService.updateUser(parseInt(id), {
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          is_active: values.is_active
        });
        setUser(updatedUser);

        // Check if applications changed and update if needed
        const currentAppIds = user?.applications.map(app => app.id) || [];
        const formAppIds = values.applications;

        if (JSON.stringify(currentAppIds.sort()) !== JSON.stringify(formAppIds.sort())) {
          await userService.assignApplications(parseInt(id), values.applications);
        }

        navigate(`/user-management/detail/${id}`);
      } else {
        // Create new user
        const newUser = await userService.createUser({
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          is_active: values.is_active
        });

        // Assign applications to the new user
        if (values.applications.length > 0) {
          await userService.assignApplications(newUser.id, values.applications);
        }

        navigate('/user-management');
      }
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate(isEditing ? `/user-management/detail/${id}` : '/user-management');
  };

  if (isEditing && loading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader text='Loading User Details...' />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={handleBack} className="mr-4">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit User' : 'Create New User'}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Basic user details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Inactive users cannot login to the system
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Access</CardTitle>
              <CardDescription>Assign applications to this user</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="applications"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Applications</FormLabel>
                      <FormDescription>
                        Select the applications this user should have access to
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {applications.map((app) => (
                        <FormField
                          key={app.id}
                          control={form.control}
                          name="applications"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={app.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(app.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), app.id])
                                        : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== app.id
                                          )
                                        )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {app.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <CardFooter className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </div>
  );
};

export default UserForm;