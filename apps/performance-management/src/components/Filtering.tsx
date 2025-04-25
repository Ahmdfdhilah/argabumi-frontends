import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { InfoIcon, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@workspace/ui/components/card";
import { ReactNode } from "react";

export interface FilteringParams {
    children?: ReactNode;
}

function Filtering({
    children
}: FilteringParams) {
    // State to manage filter visibility
    const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);

    // Toggle filter visibility
    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    return (
        <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4 flex flex-row justify-between items-center">
                <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                    <Filter className="text-[#1B6131] dark:text-[#46B749] w-5 h-5 mr-2" />
                    Filter Options
                </CardTitle>

                {/* Toggle Button for Filters */}
                <button
                    onClick={toggleFilterVisibility}
                    className="flex items-center space-x-2 text-[#1B6131] dark:text-[#46B749] hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md"
                >
                    {isFilterVisible ? (
                        <>
                            <ChevronUp className="h-4 w-4" />
                            <span className="text-sm">Hide Filters</span>
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4" />
                            <span className="text-sm">Show Filters</span>
                        </>
                    )}
                </button>
            </CardHeader>

            {/* Conditionally render filter content */}
            {isFilterVisible && (
                <CardContent className="pt-6">
                    <div className="w-full space-y-6">
                        <Alert className="bg-[#E4EFCF]/30 dark:bg-[#E4EFCF]/10 border-[#46B749] dark:border-[#1B6131]">
                            <InfoIcon className="h-5 w-5 text-[#46B749] dark:text-[#1B6131]" />
                            <AlertTitle className="text-[#46B749] dark:text-[#1B6131] font-semibold">
                                Filter Instructions
                            </AlertTitle>
                            <AlertDescription className="text-gray-700 dark:text-gray-300">
                                Select filters to display matching data. Combine multiple filters for more precise results.
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {/* Render children filters */}
                            {children}
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

export default Filtering;