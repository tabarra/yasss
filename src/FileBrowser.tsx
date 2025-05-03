import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/lib/useNavigation";
import type { ScandirDatum, ScandirDirEntry, ScandirFileEntry } from "./routes/listFiles";
import { RefreshCw, UploadIcon, XIcon, Loader2Icon } from "lucide-react";
import BrowserBreadcrumbs from "./components/BrowserBreadcrumbs";
import BrowserFolder from "./components/BrowserFolder";
import BrowserFile from "./components/BrowserFile";
import BrowserTableHeader, { type SortField, type SortState } from "./components/BrowserTableHeader";

export function FileBrowser() {
    const [items, setItems] = useState<ScandirDatum[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortState, setSortState] = useState<SortState>({
        field: "name",
        direction: "asc"
    });
    const { currentPath, navigateTo } = useNavigation();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchFiles = async (dirPath = currentPath) => {
        setIsLoading(true);
        setError(null);
        try {
            // Make request
            const tsStart = Date.now();
            const res = await fetch(`/api/listFiles?path=${encodeURIComponent(dirPath)}`);
            const elapsed = Date.now() - tsStart;
            
            // Artifical delay to make it feel less jumpy
            const minDelay = 175;
            if (elapsed < minDelay) {
                await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
            }

            // Parse response
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || res.statusText);
            }
            const data = await res.json();
            if (!Array.isArray(data)) {
                throw new Error('Invalid response format');
            }
            setItems(data);
            navigateTo(dirPath);
        } catch (error) {
            setError(String(error));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentPath);
    }, []);

    const handleSort = (field: SortField) => {
        // If clicking the same field, toggle direction
        if (field === sortState.field) {
            setSortState({
                field,
                direction: sortState.direction === "asc" ? "desc" : "asc"
            });
        } else {
            // If clicking a new field, set to that field with ascending direction
            setSortState({
                field,
                direction: "asc"
            });
        }
    };

    const sortedItems = [...items].sort((a, b) => {
        // Directories always come first
        if (a.dir && !b.dir) return -1;
        if (!a.dir && b.dir) return 1;

        // Multiplier for sort direction
        const directionMultiplier = sortState.direction === "asc" ? 1 : -1;

        // Then sort based on selected criteria
        switch (sortState.field) {
            case "name":
                return directionMultiplier * a.name.localeCompare(b.name);
            case "type":
                const aType = a.name.split('.').pop() || "";
                const bType = b.name.split('.').pop() || "";
                return directionMultiplier * aType.localeCompare(bType);
            case "size":
                if (a.dir || b.dir) return 0;
                return directionMultiplier * (('size' in a && 'size' in b) ? a.size - b.size : 0);
            case "modified":
                if (a.dir || b.dir) return 0;
                return directionMultiplier * (('modified' in a && 'modified' in b) ? a.modified - b.modified : 0);
            default:
                return 0;
        }
    });

    const handleDownload = (filePath: string) => {
        // Create a download link
        window.open(`/api/download?path=${encodeURIComponent(filePath)}`, '_blank');
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
            
            // Add current path if navigated to a subdirectory
            if (currentPath) {
                formData.append('path', currentPath);
            }
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload', true);
            
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress);
                }
            };
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    fetchFiles(currentPath); // Refresh file list
                } else {
                    setError(`Upload failed: ${xhr.statusText}`);
                }
                setIsUploading(false);
            };
            
            xhr.onerror = () => {
                setError('Upload failed');
                setIsUploading(false);
            };
            
            xhr.send(formData);
        } catch (error) {
            setError(String(error));
            setIsUploading(false);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleUpload(e.target.files);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files);
        }
    };

    const navigateToFolder = (folderPath: string) => {
        fetchFiles(folderPath);
    };

    return (
        <div 
            className={cn(
                "w-full flex flex-col gap-4 text-left relative",
                dragActive && "outline-dashed outline-2 outline-blue-500 bg-blue-50/20"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <BrowserBreadcrumbs 
                    currentPath={currentPath} 
                    onNavigate={navigateToFolder} 
                />
                
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => fetchFiles(currentPath)} 
                        disabled={isLoading}
                        className="flex items-center gap-1"
                    >
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    
                    <Button 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1"
                    >
                        <UploadIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Upload</span>
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        multiple
                        className="hidden"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-100 text-red-800 rounded-md flex justify-between items-center">
                    <span>Error: {error}</span>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setError(null)}
                        className="h-6 w-6 p-0"
                    >
                        <XIcon className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {isUploading && (
                <div className="p-4 border rounded-md bg-muted/50">
                    <div className="flex justify-between mb-2">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <div className="border rounded-lg overflow-hidden relative xmin-h-60">
                <div className="grid grid-cols-12 bg-muted">
                    <BrowserTableHeader 
                        label="Name" 
                        field="name" 
                        currentSort={sortState} 
                        onSort={handleSort} 
                        className="col-span-5"
                    />
                    <BrowserTableHeader 
                        label="Type" 
                        field="type" 
                        currentSort={sortState} 
                        onSort={handleSort} 
                        className="col-span-2"
                    />
                    <BrowserTableHeader 
                        label="Size" 
                        field="size" 
                        currentSort={sortState} 
                        onSort={handleSort} 
                        className="col-span-2"
                    />
                    <BrowserTableHeader 
                        label="Modified" 
                        field="modified" 
                        currentSort={sortState} 
                        onSort={handleSort} 
                        className="col-span-2"
                    />
                    <div className="col-span-1" />
                </div>

                <div className="divide-y">
                    {sortedItems.length === 0 && !isLoading ? (
                        <div className="p-4 text-center text-muted-foreground">
                            {currentPath ? "This folder is empty" : "No files found"}
                        </div>
                    ) : (
                        sortedItems.map((item) => 
                            item.dir ? (
                                <BrowserFolder 
                                    key={item.path}
                                    folder={item as ScandirDirEntry}
                                    onNavigate={navigateToFolder}
                                />
                            ) : (
                                <BrowserFile
                                    key={item.path}
                                    file={item as ScandirFileEntry}
                                    onDownload={handleDownload}
                                />
                            )
                        )
                    )}
                </div>
                
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium">Loading...</p>
                        </div>
                    </div>
                )}
            </div>
            
            {dragActive && (
                <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary flex items-center justify-center z-20">
                    <div className="text-center">
                        <p className="text-lg font-semibold">Drop files here</p>
                        <p className="text-sm text-muted-foreground">Upload to current directory</p>
                    </div>
                </div>
            )}
        </div>
    );
}
