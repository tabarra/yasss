import { FolderIcon } from "lucide-react";
import type { ScandirDirEntry } from "@/routes/listFiles";

type BrowserFolderProps = {
    folder: ScandirDirEntry;
    onNavigate: (path: string) => void;
};

export default function BrowserFolder({ folder, onNavigate }: BrowserFolderProps) {
    return (
        <div 
            className="grid grid-cols-12 items-center px-4 py-2 hover:bg-muted/50 cursor-pointer"
            onClick={() => onNavigate(folder.path)}
        >
            <div className="col-span-5 flex items-center gap-2 truncate">
                <FolderIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span className="truncate">{folder.name}</span>
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">
                Folder
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">
                -
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">
                -
            </div>
            <div className="col-span-1"></div>
        </div>
    );
}
