import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { InfoIcon, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@workspace/ui/components/card";
import { ReactNode } from "react";

export interface FilteringParams {
    children?: ReactNode;
}

function Filtering({ children }: FilteringParams) {
    const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);

    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    return (
        <Card className="border-secondary-500 dark:border-primary-600 shadow-md">
            <CardHeader className="bg-accent/30 dark:bg-sidebar-accent/10 pb-4 flex flex-row justify-between items-center">
                <CardTitle className="font-semibold text-foreground dark:text-foreground flex items-center">
                    <Filter className="text-primary-600 dark:text-secondary-500 w-5 h-5 mr-2" />
                    Filter Options
                </CardTitle>

                <button
                    onClick={toggleFilterVisibility}
                    className="flex items-center space-x-2 text-primary-600 dark:text-secondary-500 hover:bg-muted/20 dark:hover:bg-muted/30 p-2 rounded-md"
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

            {isFilterVisible && (
                <CardContent className="pt-6">
                    <div className="w-full space-y-6">
                        <Alert className="bg-accent/30 dark:bg-accent/10 border-secondary-500 dark:border-primary-600">
                            <InfoIcon className="h-5 w-5 text-secondary-500 dark:text-primary-600" />
                            <AlertTitle className="text-secondary-500 dark:text-primary-600 font-semibold">
                                Filter Instructions
                            </AlertTitle>
                            <AlertDescription className="text-foreground dark:text-muted-foreground">
                                Select filters to display matching data. Combine multiple filters for more precise results.
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {children}
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

export default Filtering;