import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useToast } from "@workspace/ui/components/sonner";
import { useNavigate, useParams } from 'react-router-dom';
import { periodService, PeriodCreate } from '@/services/periodService';
import Footer from '@/components/Footer';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Alert, AlertDescription } from "@workspace/ui/components/alert";

const PeriodFormPage = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { toast } = useToast();

    // Layout state
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Form state
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSaving, setIsSaving] = useState(false);
    const [period, setPeriod] = useState<PeriodCreate>({
        period_name: `Period ${new Date().getFullYear()}`,
        period_year: new Date().getFullYear(),
        period_start_date: `${new Date().getFullYear()}-01-01`,
        period_end_date: `${new Date().getFullYear()}-12-31`,
        period_description: '',
    });

    // Validation state
    const [formErrors, setFormErrors] = useState({
        period_name: false,
        period_start_date: false,
        period_end_date: false,
    });

    // Fetch period data when in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const fetchPeriod = async () => {
                try {
                    setIsLoading(true);
                    const data = await periodService.getPeriodById(parseInt(id));
                    console.log(data);
                    
                    setPeriod({
                        period_name: data.period_name,
                        period_year: data.period_year,
                        period_start_date: data.period_start_date,
                        period_end_date: data.period_end_date,
                        period_description: data.period_description || '',
                    });
                    setIsLoading(false);
                } catch (error) {
                    console.error("Error fetching period:", error);
                    navigate('/performance-management/periods');
                }
            };

            fetchPeriod();
        }
    }, [id, isEditMode, navigate]);

    const validateForm = () => {
        const errors = {
            period_name: !period.period_name.trim(),
            period_start_date: !period.period_start_date,
            period_end_date: !period.period_end_date,
        };

        // Validate dates
        if (!errors.period_start_date && !errors.period_end_date) {
            const startDate = new Date(period.period_start_date);
            const endDate = new Date(period.period_end_date);
            if (endDate < startDate) {
                errors.period_end_date = true;
                toast({
                    title: "Validation Error",
                    description: "End date cannot be before start date",
                    variant: "destructive",
                });
            }
        }

        setFormErrors(errors);
        return !Object.values(errors).some(error => error);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPeriod(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field if it was previously marked as error
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: false
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields correctly",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            if (isEditMode && id) {
                await periodService.updatePeriod(parseInt(id), period);
                toast({
                    title: "Success",
                    description: "Period updated successfully",
                });
            } else {
                await periodService.createPeriod(period);
                toast({
                    title: "Success",
                    description: "Period created successfully",
                });
            }
            navigate('/performance-management/periods');
        } catch (error) {
            console.error("Error saving period:", error);
            toast({
                title: "Error",
                description: `Failed to ${isEditMode ? 'update' : 'create'} period. Please try again.`,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="font-montserrat min-h-screen bg-white dark:bg-gray-900">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
            />

            <div className="flex">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />
                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2 md:px-4 pt-16 pb-12 transition-all duration-300 ease-in-out w-full'>
                        <div className="mx-auto">
                            <div className="mb-6">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/performance-management/periods')}
                                    className="flex items-center"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Periods
                                </Button>
                            </div>

                            <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
                                <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419]">
                                    <CardTitle className="text-gray-700 dark:text-gray-200">
                                        {isEditMode ? 'Edit Period' : 'Create New Period'}
                                    </CardTitle>
                                </CardHeader>

                                {isLoading ? (
                                    <CardContent className="flex justify-center items-center p-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-[#1B6131]" />
                                        <span className="ml-2">Loading period data...</span>
                                    </CardContent>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <CardContent className="space-y-6 pt-6">
                                            {isEditMode && (
                                                <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    <AlertDescription>
                                                        You are editing an existing period. Some fields may be restricted based on the period's current status.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            <div className="space-y-2">
                                                <Label htmlFor="period_name">
                                                    Period Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="period_name"
                                                    name="period_name"
                                                    value={period.period_name}
                                                    onChange={handleInputChange}
                                                    className={formErrors.period_name ? "border-red-500" : ""}
                                                    required
                                                />
                                                {formErrors.period_name && (
                                                    <p className="text-red-500 text-sm">Period name is required</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="period_year">Year</Label>
                                                <Input
                                                    id="period_year"
                                                    name="period_year"
                                                    type="number"
                                                    value={period.period_year}
                                                    onChange={handleInputChange}
                                                    min={new Date().getFullYear() - 10}
                                                    max={new Date().getFullYear() + 10}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="period_start_date">
                                                        Start Date <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="period_start_date"
                                                        name="period_start_date"
                                                        type="date"
                                                        value={period.period_start_date}
                                                        onChange={handleInputChange}
                                                        className={formErrors.period_start_date ? "border-red-500" : ""}
                                                        required
                                                    />
                                                    {formErrors.period_start_date && (
                                                        <p className="text-red-500 text-sm">Start date is required</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="period_end_date">
                                                        End Date <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="period_end_date"
                                                        name="period_end_date"
                                                        type="date"
                                                        value={period.period_end_date}
                                                        onChange={handleInputChange}
                                                        className={formErrors.period_end_date ? "border-red-500" : ""}
                                                        required
                                                    />
                                                    {formErrors.period_end_date && (
                                                        <p className="text-red-500 text-sm">End date is required</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="period_description">Description</Label>
                                                <Textarea
                                                    id="period_description"
                                                    name="period_description"
                                                    value={period.period_description}
                                                    onChange={handleInputChange}
                                                    rows={4}
                                                    placeholder="Enter a description for this period (optional)"
                                                />
                                            </div>
                                        </CardContent>

                                        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-800">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => navigate('/performance-management/periods')}
                                                disabled={isSaving}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                className="bg-[#1B6131] hover:bg-[#134a25] text-white"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        {isEditMode ? 'Update Period' : 'Create Period'}
                                                    </>
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </form>
                                )}
                            </Card>
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default PeriodFormPage;