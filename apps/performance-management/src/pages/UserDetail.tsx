import { JSXElementConstructor, ReactElement, ReactNode, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import {
    Avatar,
    AvatarFallback,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Calendar,
    Edit
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import Footer from '@/components/Footer';

const UserDetailPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentRole, setCurrentRole] = useState('admin');

    // Dummy user data
    const userData = {
        id: "USR001",
        name: "Daffa Abdurahman",
        email: "daffa.abdurahman@company.com",
        phone: "+62 812-3456-7890",
        department: "Information Technology",
        position: "Senior Developer",
        joinDate: "15 March 2020",
        status: "Active",
        location: "Jakarta HQ",
        image: null,
        performanceData: {
            mpmCompletionRate: 92,
            ipmCompletionRate: 87,
            overallScore: 3.4,
            performanceTrend: [75, 82, 78, 90, 95, 92]
        },
        roles: ["employee"]
    };

    // Function to render status badge with appropriate color
    const renderStatusBadge = (status: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined) => {
        let className = "text-xs font-medium py-1 px-2 rounded-full ";

        switch (status) {
            case "Active":
                className += "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                break;
            case "Inactive":
                className += "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
                break;
            case "Suspended":
                className += "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
                break;
            default:
                className += "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        }

        return <span className={className}>{status}</span>;
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-montserrat">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                currentRole={currentRole}
                setCurrentRole={setCurrentRole}
                currentSystem='Performance Management System'
            />

            <div className="flex">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    role={currentRole}
                    system="performance-management"
                />

                <div className={`flex flex-col mt-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} w-full`}>
                    <main className='flex-1 px-2  md:px-4  pt-16 pb-12 transition-all duration-300 ease-in-out  w-full'>
                        <Breadcrumb
                            items={[]}
                            currentPage="User Detail"
                            showHomeIcon={true}
                        />
                        {/* User Profile Card */}
                        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md lg:col-span-1 mb-8">
                            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] flex flex-col">
                                <Avatar className="h-24 w-24 mb-4 border-4 border-white dark:border-gray-800">
                                    <AvatarFallback className="bg-[#1B6131] text-white dark:bg-[#46B749] text-2xl">
                                        {userData.name.split(' ').map(name => name[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-gray-700 dark:text-gray-200 ">
                                    {userData.name}
                                </CardTitle>
                                <div className="mt-4 w-full">
                                    {renderStatusBadge(userData.status)}
                                </div>

                                <div className="my-2 flex flex-wrap gap-2">
                                    {userData.roles.map((role, index) => (
                                        <Badge
                                            key={index}
                                            className="bg-[#1B6131] hover:bg-[#1B6131] dark:bg-[#46B749] dark:hover:bg-[#46B749]"
                                        >
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </Badge>
                                    ))}
                                </div>

                                <Button
                                    className=" w-fit flex items-center justify-center gap-2 bg-[#1B6131] hover:bg-[#144d27] dark:text-black text-white dark:bg-[#46B749] dark:hover:bg-[#3da33f]"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Profile
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Mail className="h-5 w-5 text-[#1B6131] dark:text-[#46B749] mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="text-sm">{userData.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <Phone className="h-5 w-5 text-[#1B6131] dark:text-[#46B749] mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                            <p className="text-sm">{userData.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <Briefcase className="h-5 w-5 text-[#1B6131] dark:text-[#46B749] mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                                            <p className="text-sm">{userData.department}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <User className="h-5 w-5 text-[#1B6131] dark:text-[#46B749] mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Position</p>
                                            <p className="text-sm">{userData.position}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <MapPin className="h-5 w-5 text-[#1B6131] dark:text-[#46B749] mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                                            <p className="text-sm">{userData.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 text-[#1B6131] dark:text-[#46B749] mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Join Date</p>
                                            <p className="text-sm">{userData.joinDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;