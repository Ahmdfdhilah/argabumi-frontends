import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { LineChartIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PerformanceChartProps {
  data: { month: string; mpm: number; ipm: number; target: number }[];
  title: string;
  description?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, title, description }) => {
  const [chartHeight, setChartHeight] = useState(300);
  const [isMobile, setIsMobile] = useState(false);

  // Check window size on mount and resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setChartHeight(mobile ? 400 : 300);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className="border-[#46B749] dark:border-[#1B6131] shadow-md w-full">
      <CardHeader className="bg-gradient-to-r from-[#f0f9f0] to-[#e6f3e6] dark:from-[#0a2e14] dark:to-[#0a3419] pb-4">
        <CardTitle className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
          <LineChartIcon className="h-5 w-5 mr-2 text-[#1B6131] dark:text-[#46B749]" />
          {title}
        </CardTitle>
        {description && 
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {description}
          </CardDescription>
        }
      </CardHeader>

      <CardContent className="pt-5">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-4 mb-4">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-[#1B6131] rounded-full mr-2"></span>
            <span className="text-sm">MPM Score</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-[#46B749] rounded-full mr-2"></span>
            <span className="text-sm">IPM Score</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
            <span className="text-sm">Target</span>
          </div>
        </div>
        
        <div className="w-full h-full min-h-64">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart
              data={data}
              margin={isMobile ? 
                { top: 20, right: 10, left: 0, bottom: 20 } : 
                { top: 20, right: 30, left: 20, bottom: 5 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#666666' }}
                height={40}
                tickMargin={10}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
              />
              <YAxis 
                tick={{ fill: '#666666' }} 
                domain={[80, 100]}
                width={isMobile ? 40 : 30}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              />
              <Legend 
                verticalAlign={isMobile ? "bottom" : "top"}
                height={isMobile ? 60 : 36}
                wrapperStyle={isMobile ? { paddingTop: "20px" } : {}}
              />
              <Line
                type="monotone"
                dataKey="mpm"
                stroke="#1B6131"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                name="MPM Score"
                dot={{ strokeWidth: 2, r: isMobile ? 4 : 3 }}
              />
              <Line
                type="monotone"
                dataKey="ipm"
                stroke="#46B749"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                name="IPM Score"
                dot={{ strokeWidth: 2, r: isMobile ? 4 : 3 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#9CA3AF"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
                dot={{ strokeWidth: 2, r: isMobile ? 4 : 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};