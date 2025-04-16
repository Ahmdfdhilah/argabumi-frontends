// src/pages/UserManagement/UserDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, userService } from '@/services/userService';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { 
  ArrowLeft, 
  Edit2, 
  Clock, 
  Mail, 
  User as UserIcon, 
  X, 
  Check,
  Trash2
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import Loader from '@workspace/ui/components/ui/loading';

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [removeAppModalOpen, setRemoveAppModalOpen] = useState(false);
  const [appToRemove, setAppToRemove] = useState<{ id: number, name: string } | null>(null);

  const fetchUserData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const userData = await userService.getUserById(parseInt(id));
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const handleEdit = () => {
    navigate(`/user-management/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/user-management');
  };

  const confirmRemoveApp = (appId: number, appName: string) => {
    setAppToRemove({ id: appId, name: appName });
    setRemoveAppModalOpen(true);
  };

  const handleRemoveApp = async () => {
    if (appToRemove && id && user) {
      setLoading(true);
      try {
        await userService.removeApplication(parseInt(id), appToRemove.id);
        // Update local state after removing the application
        setUser({
          ...user,
          applications: user.applications.filter(app => app.id !== appToRemove.id)
        });
        setRemoveAppModalOpen(false);
        setAppToRemove(null);
      } catch (error) {
        console.error("Failed to remove application:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader text='Loading User Details...' />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">User not found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>The requested user does not exist or you don't have permission to view it.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack}>Return to user list</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>
        <Button onClick={handleEdit}>
          <Edit2 size={16} className="mr-2" />
          Edit User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic user details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <UserIcon size={18} className="mr-2 text-gray-500" />
              <div>
                <div className="font-medium">{user.first_name} {user.last_name}</div>
                <div className="text-sm text-gray-500">Full Name</div>
              </div>
            </div>
            <div className="flex items-center">
              <Mail size={18} className="mr-2 text-gray-500" />
              <div>
                <div className="font-medium">{user.email}</div>
                <div className="text-sm text-gray-500">Email Address</div>
              </div>
            </div>
            <div className="flex items-center">
              <Clock size={18} className="mr-2 text-gray-500" />
              <div>
                <div className="font-medium">
                  {formatDistance(new Date(user.created_at), new Date(), { addSuffix: true })}
                </div>
                <div className="text-sm text-gray-500">Account Created</div>
              </div>
            </div>
            <div className="pt-2">
              <div className="text-sm text-gray-500 mb-2">Status</div>
              {user.is_active ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <Check size={14} className="mr-1" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <X size={14} className="mr-1" /> Inactive
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Assigned Applications</CardTitle>
            <CardDescription>Applications this user has access to</CardDescription>
          </CardHeader>
          <CardContent>
            {user.applications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.applications.map((app) => (
                  <Card key={app.id} className="bg-gray-50 dark:bg-gray-800 border">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{app.name}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => confirmRemoveApp(app.id, app.name)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{app.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No applications assigned to this user.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleEdit} variant="outline">
              Manage Applications
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Remove Application Confirmation Dialog */}
      <Dialog open={removeAppModalOpen} onOpenChange={setRemoveAppModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Application</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to remove <span className="font-bold">{appToRemove?.name}</span> from this user?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveAppModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveApp}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetail;