import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Application, applicationService } from '@/services/applicationService';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import {
    ArrowLeft,
    Edit2,
    Clock,
    Globe,
    Code,
    FileText,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import Loader from '@workspace/ui/components/ui/loading';

const ApplicationDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const fetchApplication = async () => {
            if (!id) return;
            
            setLoading(true);
            setError(null);
            try {
                const data = await applicationService.fetchApplicationById(Number(id));
                setApplication(data);
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
    }, [id]);

    const handleDelete = async () => {
        if (!application) return;

        setLoading(true);
        try {
            await applicationService.deleteApplication(application.id);
            setDeleteDialogOpen(false);
            navigate('/application-management');
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Failed to delete application');
            console.error('Error deleting application:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader />
            </div>
        );
    }

    if (error) {
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
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <p className="text-lg text-red-600">{error}</p>
                            <Button
                                onClick={() => navigate('/application-management')}
                                className="mt-4"
                            >
                                Return to Applications List
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!application) {
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
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <p className="text-lg">Application not found.</p>
                            <Button
                                onClick={() => navigate('/application-management')}
                                className="mt-4"
                            >
                                Return to Applications List
                            </Button>
                        </div>
                    </CardContent>
                </Card>
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
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{application.name}</CardTitle>
                            <CardDescription className="mt-2 flex items-center">
                                <Code className="h-4 w-4 mr-1" />
                                {application.code}
                            </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/application-management/edit/${application.id}`)}
                            >
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                            <Globe className="h-5 w-5 mr-2 text-gray-500" />
                            <a
                                href={application.base_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all"
                            >
                                {application.base_url}
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md flex items-start">
                            <FileText className="h-5 w-5 mr-2 text-gray-500 mt-1" />
                            <p className="whitespace-pre-wrap">
                                {application.description || "No description provided."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium mb-1 text-gray-500">Created At</h3>
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                {format(new Date(application.created_at), 'MMMM dd, yyyy HH:mm')}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-1 text-gray-500">Last Updated</h3>
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                {format(new Date(application.updated_at), 'MMMM dd, yyyy HH:mm')}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Application</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        Are you sure you want to delete <span className="font-semibold">{application.name}</span>?
                        This action cannot be undone.
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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

export default ApplicationDetail;