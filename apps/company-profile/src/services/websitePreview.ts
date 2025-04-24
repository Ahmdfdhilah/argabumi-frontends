// src/services/websitePreviewService.ts
import { browserApi } from "@/utils/api";
import { useToast } from "@workspace/ui/components/sonner";

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  quality?: number;
  fullPage?: boolean;
}

export interface ScreenshotResponse {
  image_data: string; // Base64 encoded image data
  width: number;
  height: number;
  title: string;
  timestamp: string;
}

export interface MetadataResponse {
  title: string;
  description?: string;
  favicon?: string;
  og_image?: string;
  domain: string;
  content_type: string;
  last_updated: string;
  technologies: string[];
  status_code: number;
  load_time: number;
  secure: boolean;
  language?: string;
  responsive: boolean;
}

export interface ResourceInfo {
  type: string;
  url: string;
  size: number;
  load_time: number;
}

export interface PerformanceMetrics {
  first_contentful_paint: number;
  largest_contentful_paint: number;
  time_to_interactive: number;
  total_blocking_time: number;
  cumulative_layout_shift: number;
  speed_index: number;
}

export interface PerformanceResponse {
  metrics: PerformanceMetrics;
  page_weight: number;
  resources: ResourceInfo[];
  requests_count: number;
  summary_score: number;
}

export interface SourceCodeResponse {
  html: string;
  css: Array<{ url?: string; content?: string; inline: boolean }>;
  js: Array<{ url?: string; content?: string; inline: boolean }>;
  document_structure?: Record<string, any>;
  seo_issues?: Array<Record<string, any>>;
  accessibility_issues?: Array<Record<string, any>>;
}

const { toast } = useToast();

export const websitePreviewService = {
  // Get a screenshot of a website
  getScreenshot: async (url: string, options: ScreenshotOptions = {}): Promise<ScreenshotResponse> => {
    try {
      const { width = 1280, height = 720, quality = 80, fullPage = false } = options;
      
      const response = await browserApi.get("/web-preview/screenshot", {
        params: { 
          url,
          width,
          height,
          quality,
          full_page: fullPage
        }
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Screenshot Error",
        description: error.response?.data?.detail || "Failed to capture website screenshot",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get metadata for a website
  getMetadata: async (url: string): Promise<MetadataResponse> => {
    try {
      const response = await browserApi.get("/web-preview/metadata", {
        params: { url }
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Metadata Error",
        description: error.response?.data?.detail || "Failed to fetch website metadata",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Analyze website performance
  getPerformance: async (url: string): Promise<PerformanceResponse> => {
    try {
      const response = await browserApi.get("/web-preview/performance", {
        params: { url }
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Performance Analysis Error",
        description: error.response?.data?.detail || "Failed to analyze website performance",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get website source code
  getSourceCode: async (url: string): Promise<SourceCodeResponse> => {
    try {
      const response = await browserApi.get("/web-preview/source", {
        params: { url }
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Source Code Error",
        description: error.response?.data?.detail || "Failed to extract website source code",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Unified method to get all website preview data at once
  getFullWebsitePreview: async (url: string, options: ScreenshotOptions = {}): Promise<{
    screenshot: ScreenshotResponse;
    metadata: MetadataResponse;
    performance: PerformanceResponse;
    sourceCode: SourceCodeResponse;
  }> => {
    try {
      // Execute all requests in parallel
      const [screenshot, metadata, performance, sourceCode] = await Promise.all([
        websitePreviewService.getScreenshot(url, options),
        websitePreviewService.getMetadata(url),
        websitePreviewService.getPerformance(url),
        websitePreviewService.getSourceCode(url)
      ]);
      
      return {
        screenshot,
        metadata,
        performance,
        sourceCode
      };
    } catch (error: any) {
      toast({
        title: "Website Preview Error",
        description: error.response?.data?.detail || "Failed to generate complete website preview",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Validate URL format (helper method)
  validateUrl: (url: string): string => {
    if (!url) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid website URL",
        variant: "destructive",
      });
      throw new Error("URL parameter is required");
    }
    
    // Add scheme if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    try {
      new URL(url);
      return url;
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "The provided URL is not valid",
        variant: "destructive",
      });
      throw new Error("Invalid URL format");
    }
  }
};

export default websitePreviewService;