// src/pages/UserManagement/UserList.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, userService } from '@/services/userService';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import {
    PlusCircle,
    Edit2,
    Trash2,
    Info,
    Check,
    X,
    Search
} from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import Loader from '@workspace/ui/components/ui/loading';

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleAddUser = () => {
        navigate('/user-management/add');
    };

    const handleEdit = (userId: number) => {
        navigate(`/user-management/edit/${userId}`);
    };

    const handleViewDetails = (userId: number) => {
        navigate(`/user-management/detail/${userId}`);
    };

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (userToDelete) {
            setLoading(true);
            try {
                await userService.deleteUser(userToDelete.id);
                // Update local state after successful deletion
                setUsers(users.filter(user => user.id !== userToDelete.id));
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
            } catch (error) {
                console.error("Failed to delete user:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Button onClick={handleAddUser} className="flex items-center gap-2">
                    <PlusCircle size={16} />
                    Add User
                </Button>
            </div>

            <div className="mb-4 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search users by name or email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader text='Loading Users...' />
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-32">Applications</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.first_name} {user.last_name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Check size={12} className="mr-1" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <X size={12} className="mr-1" /> Inactive
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{user.applications.length}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewDetails(user.id)}
                                                    title="View details"
                                                    className='p-1 md:p-2'
                                                >
                                                    <Info className="h-4 w-4" />
                                                    <span className="sr-only md:not-sr-only md:ml-1">View</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className='p-1 md:p-2'
                                                    onClick={() => handleEdit(user.id)}
                                                    title="Edit user"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                    <span className="sr-only md:not-sr-only md:ml-1">Edit</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => confirmDelete(user)}
                                                    title="Delete user"
                                                    className='p-1 md:p-2'
                                                >
                                                   <Trash2 className="h-4 w-4" />
                                                   <span className="sr-only md:not-sr-only md:ml-1">Delete</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        Are you sure you want to delete user{" "}
                        <span className="font-bold">
                            {userToDelete?.first_name} {userToDelete?.last_name} ({userToDelete?.email})
                        </span>
                        ? This action cannot be undone.
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserList;