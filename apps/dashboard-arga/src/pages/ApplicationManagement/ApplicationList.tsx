import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Application, applicationService } from '@/services/applicationService';
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
    Search
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import Loader from '@workspace/ui/components/ui/loading';
import { format } from 'date-fns';

const ApplicationList = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await applicationService.fetchApplications();
            setApplications(data);
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Failed to fetch applications');
            console.error('Error fetching applications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredApplications = applications.filter((app) =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.description && app.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDeleteClick = (application: Application) => {
        setApplicationToDelete(application);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (applicationToDelete) {
            setLoading(true);
            try {
                await applicationService.deleteApplication(applicationToDelete.id);
                setApplications(applications.filter(app => app.id !== applicationToDelete.id));
            } catch (err) {
                setError(typeof err === 'string' ? err : 'Failed to delete application');
                console.error('Error deleting application:', err);
            } finally {
                setLoading(false);
                setDeleteDialogOpen(false);
                setApplicationToDelete(null);
            }
        }
    };

    const handleViewDetails = (id: number) => {
        navigate(`/application-management/detail/${id}`);
    };

    const handleEdit = (id: number) => {
        navigate(`/application-management/edit/${id}`);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Applications</h1>
                <Button onClick={() => navigate('/application-management/new')} className="bg-primary hover:bg-primary/90">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Application
                </Button>
            </div>

            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                    type="text"
                    placeholder="Search applications..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center">
                    <Loader />
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Base URL</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApplications.length > 0 ? (
                                filteredApplications.map((application) => (
                                    <TableRow key={application.id}>
                                        <TableCell className="font-medium">{application.name}</TableCell>
                                        <TableCell>{application.code}</TableCell>
                                        <TableCell>{application.base_url}</TableCell>
                                        <TableCell>
                                            {format(new Date(application.created_at), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex gap-1 md:gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="p-1 md:p-2"
                                                    onClick={() => handleViewDetails(application.id)}
                                                    aria-label="View details"
                                                >
                                                    <Info className="h-4 w-4" />
                                                    <span className="sr-only md:not-sr-only md:ml-1">View</span>
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="p-1 md:p-2"
                                                    onClick={() => handleEdit(application.id)}
                                                    aria-label="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                    <span className="sr-only md:not-sr-only md:ml-1">Edit</span>
                                                </Button>

                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="p-1 md:p-2"
                                                    onClick={() => handleDeleteClick(application)}
                                                    aria-label="Delete"
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
                                    <TableCell colSpan={5} className="text-center py-8">
                                        {searchTerm ? 'No applications found matching your search.' : 'No applications found.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Application</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        Are you sure you want to delete <span className="font-semibold">{applicationToDelete?.name}</span>?
                        This action cannot be undone.
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ApplicationList;