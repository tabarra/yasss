import { Button } from "@/components/ui/button";
import { FileIcon, DownloadIcon } from "lucide-react";
import bytes from "bytes";
import type { ScandirFileEntry } from "@/routes/listFiles";

type BrowserFileProps = {
    file: ScandirFileEntry;
    onDownload: (filePath: string) => void;
};

export default function BrowserFile({ file, onDownload }: BrowserFileProps) {
    const getFileExtension = (filename: string) => {
        return filename.split('.').pop()?.toUpperCase() || "FILE";
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="grid grid-cols-12 items-center px-4 py-2 hover:bg-muted/30">
            <div className="col-span-5 flex items-center gap-2 truncate">
                <FileIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">
                {getFileExtension(file.name)}
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">
                {bytes(file.size)}
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">
                {formatDate(file.modified)}
            </div>
            <div className="col-span-1 flex items-center justify-end">
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDownload(file.path);
                    }}
                    title="Download file"
                    className="hover:bg-primary hover:text-primary-foreground"
                >
                    <DownloadIcon className="w-4" />
                </Button>
            </div>
        </div>
    );
}
