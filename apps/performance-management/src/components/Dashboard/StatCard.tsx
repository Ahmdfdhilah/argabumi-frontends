import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
    value: number;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value }) => {
    if (value > 0) {
        return (
            <div className="flex justify-center items-center">
                <span className="text-green-500 flex items-center">
                    <ArrowUp size={14} className="mr-1" />
                    {Math.abs(value).toFixed(1)}%
                </span>
            </div>
        );
    } else if (value < 0) {
        return (
            <div className="flex justify-center items-center">
                <span className="text-red-500 flex items-center">
                    <ArrowDown size={14} className="mr-1" />
                    {Math.abs(value).toFixed(1)}%
                </span>
            </div>
        );
    }
    return (
        <div className="flex justify-center items-center">
            <span className="text-gray-500 flex items-center">
                <Minus size={14} className="mr-1" />
                0%
            </span>
        </div>
    );
};
interface StatCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    trend?: number;
    icon?: React.ReactNode;
    progress?: number;
    color?: "green" | "blue" | "orange" | "purple";
    children?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend, icon, progress, color = "green", children }) => {
    const colorClasses = {
        green: {
            border: "border-[#46B749] dark:border-[#1B6131]",
            text: "text-[#1B6131] dark:text-[#46B749]"
        },
        blue: {
            border: "border-blue-500 dark:border-blue-700",
            text: "text-blue-700 dark:text-blue-400"
        },
        orange: {
            border: "border-orange-500 dark:border-orange-700",
            text: "text-orange-700 dark:text-orange-400"
        },
        purple: {
            border: "border-purple-500 dark:border-purple-700",
            text: "text-purple-700 dark:text-purple-400"
        }
    };

    return (
        <Card className={`${colorClasses[color].border} shadow-md dark:bg-gray-800`}>
            <CardHeader className="pb-2">
                <CardTitle className={`${colorClasses[color].text} text-lg flex items-center`}>
                    {icon && <span className="mr-2 h-5 w-5">{icon}</span>}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-4xl font-bold">
                            {value}
                        </p>
                        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
                    </div>
                    {trend !== undefined && <TrendIndicator value={trend} />}
                </div>
                {progress !== undefined && (
                    <div className="mt-4">
                        <Progress value={progress} className="h-2 bg-gray-200" />
                    </div>
                )}
                {children && <div className="mt-4">{children}</div>}

            </CardContent>
        </Card>
    );
};