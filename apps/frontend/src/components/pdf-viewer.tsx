"use client";

import { useState, useCallback } from "react";
import { FileText, Download, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface PdfViewerProps {
  /** URL to the PDF or document file */
  url: string | null;
  /** Original filename for display and download */
  filename?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Determines if a file is a PDF based on URL or filename
 */
function isPdfFile(url: string | null, filename?: string): boolean {
  if (!url) return false;
  
  const urlLower = url.toLowerCase();
  const filenameLower = filename?.toLowerCase() || "";
  
  return (
    urlLower.endsWith(".pdf") ||
    urlLower.includes(".pdf?") ||
    filenameLower.endsWith(".pdf") ||
    urlLower.includes("content-type=application/pdf")
  );
}

/**
 * PDF Viewer Component
 * 
 * Displays PDF files inline using an iframe for browser-native rendering.
 * For non-PDF files (DOCX, etc.), shows a download fallback.
 * 
 * Features:
 * - Inline PDF rendering with native browser viewer
 * - Loading state while PDF loads
 * - Error handling for failed loads
 * - Fallback UI for non-PDF documents
 * - Download and open-in-new-tab actions
 */
export function PdfViewer({ url, filename, className }: PdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isPdf = isPdfFile(url, filename);
  const displayFilename = filename || "Document";

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleDownload = useCallback(() => {
    if (!url) return;
    
    const link = document.createElement("a");
    link.href = url;
    link.download = displayFilename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [url, displayFilename]);

  const handleOpenInNewTab = useCallback(() => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);

  // No URL provided
  if (!url) {
    return (
      <Card className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="p-4 bg-muted rounded-full mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No document available</p>
      </Card>
    );
  }

  // Non-PDF file - show download fallback
  if (!isPdf) {
    return (
      <Card className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`}>
        <div className="p-4 bg-primary/10 rounded-full">
          <FileText className="w-10 h-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">Document Preview Unavailable</h4>
          <p className="text-sm text-muted-foreground max-w-xs">
            This file format cannot be previewed in the browser. 
            Download it to view the original document.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="default" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download {displayFilename.split('.').pop()?.toUpperCase()}
          </Button>
          <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open
          </Button>
        </div>
      </Card>
    );
  }

  // PDF file - render inline
  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b rounded-t-lg">
        <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
          {displayFilename}
        </span>
        <div className="flex gap-1">
          <Button 
            onClick={handleDownload} 
            variant="ghost" 
            size="sm"
            className="h-8 px-2"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            onClick={handleOpenInNewTab} 
            variant="ghost" 
            size="sm"
            className="h-8 px-2"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="relative flex-1 min-h-0 bg-muted/20 rounded-b-lg overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 p-4">
            <div className="p-3 bg-destructive/10 rounded-full mb-3">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm font-medium mb-1">Failed to load document</p>
            <p className="text-xs text-muted-foreground mb-3">
              The PDF could not be displayed
            </p>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Instead
            </Button>
          </div>
        )}

        {/* PDF Iframe */}
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          className="w-full h-full border-0"
          title={`Preview of ${displayFilename}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    </div>
  );
}
