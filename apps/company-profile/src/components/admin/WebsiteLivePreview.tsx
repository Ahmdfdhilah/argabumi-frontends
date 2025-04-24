import { useState, useEffect, useRef, useCallback } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Slider } from "@workspace/ui/components/slider";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";
import {
    ExternalLink,
    Copy,
    Check,
    Globe,
    EyeIcon,
    Smartphone,
    Tablet,
    Monitor,
    DownloadCloud,
    RefreshCw,
    AlignLeft,
    Info,
    Image as ImageIcon,
    Gauge,
    Loader2
} from "lucide-react";
import websitePreviewService, {
    ScreenshotResponse,
    MetadataResponse,
    PerformanceResponse,
    ScreenshotOptions
} from "@/services/websitePreview";

interface WebsitePreviewProps {
    url: string;
    initialMetadata?: MetadataResponse;
    className?: string;
    onRefresh?: () => void;
    autoRefreshInterval?: number; // Time in milliseconds
}

export const WebsiteLivePreview = ({
    url,
    initialMetadata,
    className = "",
    onRefresh,
    autoRefreshInterval = 60000, // Default to 1 minute
}: WebsitePreviewProps) => {
    // State variables for UI
    const [isCopied, setIsCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [previewTab, setPreviewTab] = useState("preview");
    const [viewportSize, setViewportSize] = useState<"mobile" | "tablet" | "desktop">("desktop");
    const [zoomLevel, setZoomLevel] = useState(100);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Full URL state with validation
    const [fullUrl, setFullUrl] = useState<string>("");

    // Content states with lazy loading
    const [screenshot, setScreenshot] = useState<ScreenshotResponse | null>(null);
    const [metadata, setMetadata] = useState<MetadataResponse | null>(initialMetadata || null);
    const [performance, setPerformance] = useState<PerformanceResponse | null>(null);

    // Track which tabs have been loaded/visited
    const [tabsLoaded, setTabsLoaded] = useState<Record<string, boolean>>({
        preview: false,
        metadata: false,
        performance: false
    });

    // Reference for auto-refresh intervals
    const autoRefreshIntervalRef = useRef<number>(0);

    // Define viewport dimensions
    const viewportDimensions = {
        mobile: { width: 375, height: 667 },
        tablet: { width: 768, height: 1024 },
        desktop: { width: 1280, height: 800 },
    };

    // Initialize and validate URL
    useEffect(() => {
        try {
            const validatedUrl = websitePreviewService.validateUrl(url);
            setFullUrl(validatedUrl);

            // We don't want to auto-fetch anything on initial load
            // Just set the URL and wait for user interaction
            setTabsLoaded({
                preview: false,
                metadata: !!initialMetadata,
                performance: false
            });
        } catch (err: any) {
            setError(err.message || "Invalid URL");
        }
    }, [url, initialMetadata]);

    // Handle auto-refresh only for the current active tab
    useEffect(() => {
        if (fullUrl) {
            autoRefreshIntervalRef.current = setInterval(() => {
                if (previewTab === "preview") {
                    fetchScreenshot();
                } else if (previewTab === "metadata") {
                    fetchMetadata();
                } else if (previewTab === "performance") {
                    fetchPerformance();
                }
            }, autoRefreshInterval);
        }

        return () => {
            if (autoRefreshIntervalRef.current) {
                clearInterval(autoRefreshIntervalRef.current);
            }
        };
    }, [fullUrl, autoRefreshInterval, previewTab]);

    // Copy URL to clipboard
    const handleCopyUrl = () => {
        navigator.clipboard.writeText(fullUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Fetch screenshot data - only when tab selected or viewport changes
    const fetchScreenshot = useCallback(async () => {
        if (!fullUrl) return;

        setIsLoading(true);
        setError(null);

        try {
            const screenshotOptions: ScreenshotOptions = {
                width: viewportDimensions[viewportSize].width,
                height: viewportDimensions[viewportSize].height,
                quality: 85,
                fullPage: false
            };

            const screenshotData = await websitePreviewService.getScreenshot(fullUrl, screenshotOptions);
            setScreenshot(screenshotData);
            setTabsLoaded(prev => ({ ...prev, preview: true }));
            setLastRefreshed(new Date());

            if (onRefresh) {
                onRefresh();
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch screenshot");
        } finally {
            setIsLoading(false);
        }
    }, [fullUrl, viewportSize, onRefresh]);

    // Fetch metadata - only when tab selected
    const fetchMetadata = useCallback(async () => {
        if (!fullUrl) return;

        // Skip if we already have metadata from props
        if (metadata && tabsLoaded.metadata) return;

        setIsLoading(true);
        setError(null);

        try {
            const metadataData = await websitePreviewService.getMetadata(fullUrl);
            setMetadata(metadataData);
            setTabsLoaded(prev => ({ ...prev, metadata: true }));
            setLastRefreshed(new Date());
        } catch (err: any) {
            setError(err.message || "Failed to fetch metadata");
        } finally {
            setIsLoading(false);
        }
    }, [fullUrl, metadata, tabsLoaded.metadata]);

    // Fetch performance data - only when tab selected
    const fetchPerformance = useCallback(async () => {
        if (!fullUrl) return;

        // Skip if we already have performance data
        if (performance && tabsLoaded.performance) return;

        setIsLoading(true);
        setError(null);

        try {
            const performanceData = await websitePreviewService.getPerformance(fullUrl);
            setPerformance(performanceData);
            setTabsLoaded(prev => ({ ...prev, performance: true }));
            setLastRefreshed(new Date());
        } catch (err: any) {
            setError(err.message || "Failed to fetch performance data");
        } finally {
            setIsLoading(false);
        }
    }, [fullUrl, performance, tabsLoaded.performance]);

    // Handle tab change with lazy loading
    const handleTabChange = (value: string) => {
        setPreviewTab(value);

        // Only fetch data if it's not already loaded
        if (value === "preview" && !tabsLoaded.preview) {
            fetchScreenshot();
        } else if (value === "metadata" && !tabsLoaded.metadata) {
            fetchMetadata();
        } else if (value === "performance" && !tabsLoaded.performance) {
            fetchPerformance();
        }
    };

    // Handle viewport change - only affects screenshot
    useEffect(() => {
        if (previewTab === "preview" && tabsLoaded.preview) {
            fetchScreenshot();
        }
    }, [viewportSize, previewTab, tabsLoaded.preview, fetchScreenshot]);

    // Refresh preview for current tab only
    const refreshPreview = () => {
        if (isLoading || !fullUrl) return;

        if (previewTab === "preview") {
            fetchScreenshot();
        } else if (previewTab === "metadata") {
            fetchMetadata();
        } else if (previewTab === "performance") {
            fetchPerformance();
        }
    };

    // Render viewport control buttons
    const renderViewportControls = () => (
        <ToggleGroup
            type="single"
            value={viewportSize}
            onValueChange={(value: any) => value && setViewportSize(value)}
        >
            <ToggleGroupItem value="mobile" aria-label="Mobile view">
                <Smartphone className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="tablet" aria-label="Tablet view">
                <Tablet className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="desktop" aria-label="Desktop view">
                <Monitor className="h-4 w-4" />
            </ToggleGroupItem>
        </ToggleGroup>
    );

    // Render tab content based on selected tab
    const renderTabContent = () => {
        if (isLoading) {
            return (
                <div className="h-96 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading website data...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-6 h-96 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4 max-w-md text-center">
                        <Info className="h-12 w-12 text-destructive" />
                        <h3 className="text-lg font-medium">Error loading preview</h3>
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <Button onClick={refreshPreview}>Try Again</Button>
                    </div>
                </div>
            );
        }

        // Only show loading state for the initial data fetch
        if (previewTab === "preview" && !tabsLoaded.preview && !screenshot) {
            return (
                <div className="h-96 flex items-center justify-center cursor-pointer" onClick={fetchScreenshot}>
                    <div className="flex flex-col items-center space-y-4">
                        <EyeIcon className="h-12 w-12 text-muted" />
                        <p className="text-sm text-muted-foreground">Click to load preview</p>
                    </div>
                </div>
            );
        }

        if (previewTab === "metadata" && !tabsLoaded.metadata && !metadata) {
            return (
                <div className="h-96 flex items-center justify-center cursor-pointer" onClick={fetchMetadata}>
                    <div className="flex flex-col items-center space-y-4">
                        <AlignLeft className="h-12 w-12 text-muted" />
                        <p className="text-sm text-muted-foreground">Click to load metadata</p>
                    </div>
                </div>
            );
        }

        if (previewTab === "performance" && !tabsLoaded.performance && !performance) {
            return (
                <div className="h-96 flex items-center justify-center cursor-pointer" onClick={fetchPerformance}>
                    <div className="flex flex-col items-center space-y-4">
                        <Gauge className="h-12 w-12 text-muted" />
                        <p className="text-sm text-muted-foreground">Click to load performance data</p>
                    </div>
                </div>
            );
        }

        return (
            <>
                {previewTab === "preview" && (
                    <div className="p-0 flex justify-center bg-muted/20">
                        <div
                            style={{
                                maxWidth: "100%",
                                overflow: "auto",
                                transform: `scale(${zoomLevel / 100})`,
                                transformOrigin: "top center",
                                transition: "transform 0.2s ease"
                            }}
                        >
                            {screenshot?.image_data ? (
                                <img
                                    src={`data:image/jpeg;base64,${screenshot.image_data}`}
                                    alt={`Screenshot of ${fullUrl}`}
                                    width={screenshot.width}
                                    height={screenshot.height}
                                    style={{ maxWidth: "none" }}
                                />
                            ) : (
                                <Skeleton className="w-full h-96" />
                            )}
                        </div>
                    </div>
                )}

                {previewTab === "metadata" && metadata && (
                    <div className="p-4 max-h-96 overflow-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium mb-2">Basic Information</h3>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-xs text-muted-foreground">Title</dt>
                                            <dd className="text-xs font-medium">{metadata.title}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-xs text-muted-foreground">Domain</dt>
                                            <dd className="text-xs font-medium">{metadata.domain}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-xs text-muted-foreground">Content Type</dt>
                                            <dd className="text-xs font-medium">{metadata.content_type}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-xs text-muted-foreground">Last Updated</dt>
                                            <dd className="text-xs font-medium">{metadata.last_updated}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-xs text-muted-foreground">Secure</dt>
                                            <dd className="text-xs font-medium">{metadata.secure ? "Yes" : "No"}</dd>
                                        </div>
                                        {metadata.language && (
                                            <div className="flex justify-between">
                                                <dt className="text-xs text-muted-foreground">Language</dt>
                                                <dd className="text-xs font-medium">{metadata.language}</dd>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <dt className="text-xs text-muted-foreground">Responsive</dt>
                                            <dd className="text-xs font-medium">{metadata.responsive ? "Yes" : "No"}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium mb-2">Technologies</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {metadata.technologies.map((tech, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {metadata.og_image && (
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">OG Image</h3>
                                        <div className="rounded-md overflow-hidden border">
                                            <img
                                                src={metadata.og_image}
                                                alt="Open Graph"
                                                className="w-full h-auto max-h-32 object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {previewTab === "performance" && performance && (
                    <div className="p-4 max-h-96 overflow-auto">
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium">Performance Score</h3>
                                    <div className="flex items-center">
                                        <span className="text-lg font-bold mr-2">{performance.summary_score}</span>
                                        <Badge
                                            variant={performance.summary_score > 80 ? "default" : performance.summary_score > 50 ? "secondary" : "destructive"}
                                        >
                                            {performance.summary_score > 80 ? "Good" : performance.summary_score > 50 ? "Average" : "Poor"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">First Contentful Paint</span>
                                            <span>{performance.metrics.first_contentful_paint}ms</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${Math.min(100, 100 - (performance.metrics.first_contentful_paint / 30))}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Largest Contentful Paint</span>
                                            <span>{performance.metrics.largest_contentful_paint}ms</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${Math.min(100, 100 - (performance.metrics.largest_contentful_paint / 40))}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Time to Interactive</span>
                                            <span>{performance.metrics.time_to_interactive}ms</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${Math.min(100, 100 - (performance.metrics.time_to_interactive / 50))}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-3">Resource Breakdown</h3>
                                <div className="space-y-2">
                                    {performance.resources.map((resource, index) => (
                                        <div key={index} className="text-xs flex justify-between items-center">
                                            <div className="flex items-center">
                                                <Badge variant="outline" className="mr-2">
                                                    {resource.type}
                                                </Badge>
                                                <span className="truncate max-w-[200px]">{resource.url}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span>{(resource.size / 1024).toFixed(1)} KB</span>
                                                <span className="text-muted-foreground">{resource.load_time}ms</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    // Render zoom control
    const renderZoomControl = () => (
        <div className="flex items-center space-x-2 pb-2 px-4">
            <Label htmlFor="zoom" className="text-xs">Zoom</Label>
            <Slider
                id="zoom"
                value={[zoomLevel]}
                min={25}
                max={200}
                step={25}
                onValueChange={(value) => setZoomLevel(value[0])}
                className="w-32"
            />
            <span className="text-xs font-medium">{zoomLevel}%</span>
        </div>
    );

    return (
        <Card className={`overflow-hidden border border-border shadow-sm ${className}`}>
            <CardHeader className="bg-card dark:bg-card/95 p-4 border-b">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {metadata?.favicon ? (
                                <img
                                    src={metadata.favicon}
                                    alt="Site favicon"
                                    className="w-5 h-5 mr-2 bg-white rounded-sm"
                                />
                            ) : (
                                <Globe className="mr-2 h-5 w-5 text-primary" />
                            )}
                            <CardTitle className="text-sm font-medium">
                                {metadata?.title || "Website Preview"}
                            </CardTitle>

                            {fullUrl && (
                                <Badge variant="outline" className="ml-2 text-xs bg-primary-50 text-primary-700 border-primary-200">
                                    {new URL(fullUrl).protocol.replace(":", "")}
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center space-x-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={refreshPreview}
                                            disabled={isLoading}
                                        >
                                            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Refresh preview</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <DownloadCloud className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Download</h4>
                                        <Separator />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start text-sm"
                                            onClick={() => {
                                                if (screenshot?.image_data) {
                                                    const link = document.createElement('a');
                                                    link.href = `data:image/jpeg;base64,${screenshot.image_data}`;
                                                    link.download = `screenshot-${new URL(fullUrl).hostname}-${new Date().getTime()}.jpg`;
                                                    link.click();
                                                }
                                            }}
                                            disabled={!screenshot?.image_data}
                                        >
                                            <ImageIcon className="mr-2 h-4 w-4" />
                                            Screenshot
                                        </Button>

                                        {/* <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start text-sm"
                                            onClick={() => {
                                                // In a real app, this would generate a PDF report
                                                alert("PDF download feature not implemented");
                                            }}
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            PDF Report
                                        </Button> */}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                            <Input
                                value={fullUrl}
                                readOnly
                                className="text-sm text-muted-foreground w-full"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyUrl}
                                            className="flex-shrink-0"
                                        >
                                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            <span className="ml-2 sr-only sm:not-sr-only">{isCopied ? "Copied" : "Copy"}</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isCopied ? "Copied!" : "Copy URL"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button
                                variant="default"
                                size="sm"
                                className="flex-shrink-0 bg-primary-600 hover:bg-primary-700"
                                onClick={() => window.open(fullUrl, "_blank", "noopener,noreferrer")}
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                <span className="sr-only sm:not-sr-only">Visit</span>
                            </Button>
                        </div>
                    </div>

                    {metadata?.description && (
                        <CardDescription className="text-xs">
                            {metadata.description}
                        </CardDescription>
                    )}

                    <div className="flex flex-col sm:items-center justify-between gap-3 pt-1">
                        <Tabs value={previewTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="grid grid-cols-3">
                                <TabsTrigger value="preview" className="text-xs">
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    <span className="sr-only sm:not-sr-only">Preview</span>
                                </TabsTrigger>
                                <TabsTrigger value="metadata" className="text-xs">
                                    <AlignLeft className="h-4 w-4 mr-2" />
                                    <span className="sr-only sm:not-sr-only">Metadata</span>
                                </TabsTrigger>
                                <TabsTrigger value="performance" className="text-xs">
                                    <Gauge className="h-4 w-4 mr-2" />
                                    <span className="sr-only sm:not-sr-only">Performance</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="preview" className="m-0">
                                {previewTab === "preview" && (
                                    <CardContent className="p-0 bg-gray-50 dark:bg-gray-900">
                                        {renderTabContent()}
                                    </CardContent>
                                )}
                            </TabsContent>

                            <TabsContent value="metadata" className="m-0">
                                {previewTab === "metadata" && (
                                    <CardContent className="p-0 bg-gray-50 dark:bg-gray-900">
                                        {renderTabContent()}
                                    </CardContent>
                                )}
                            </TabsContent>

                            <TabsContent value="performance" className="m-0">
                                {previewTab === "performance" && (
                                    <CardContent className="p-0 bg-gray-50 dark:bg-gray-900">
                                        {renderTabContent()}
                                    </CardContent>
                                )}
                            </TabsContent>
                        </Tabs>

                        {previewTab === "preview" && (
                            <div className="hidden sm:flex items-center">
                                {renderViewportControls()}
                            </div>
                        )}
                    </div>

                    {previewTab === "preview" && renderZoomControl()}
                </div>
            </CardHeader>

            <CardFooter className="p-3 border-t bg-muted/20 flex justify-between items-center text-xs text-muted-foreground">
                <div>
                    {lastRefreshed && (
                        <span>Last updated: {lastRefreshed.toLocaleTimeString()}</span>
                    )}
                </div>

                <div className="flex items-center">
                    {metadata?.status_code && (
                        <Badge variant={metadata.status_code === 200 ? "default" : "destructive"} className="text-xs mr-2">
                            Status: {metadata.status_code}
                        </Badge>
                    )}

                    {performance?.metrics && (
                        <span>Load time: {(performance.metrics.time_to_interactive / 1000).toFixed(2)}s</span>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
};

export default WebsiteLivePreview;