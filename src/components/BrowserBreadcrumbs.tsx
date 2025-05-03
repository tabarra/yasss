import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react";

type BreadcrumbsProps = {
    currentPath: string;
    onNavigate: (path: string) => void;
};

export default function BrowserBreadcrumbs({ currentPath, onNavigate }: BreadcrumbsProps) {
    const getBreadcrumbs = () => {
        if (!currentPath) return [];
        
        const parts = currentPath.split(/[\/\\]/).filter(Boolean);
        const breadcrumbs = [];
        
        let currentPathBuild = '';
        for (const part of parts) {
            currentPathBuild = currentPathBuild ? `${currentPathBuild}/${part}` : part;
            breadcrumbs.push({
                name: part,
                path: currentPathBuild
            });
        }
        
        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink 
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigate("");
                        }}
                        className="flex items-center gap-1"
                    >
                        <HomeIcon className="h-3.5 w-3.5" />
                        <span>Home</span>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                
                {breadcrumbs.map((crumb, index) => (
                    <BreadcrumbItem key={crumb.path}>
                        <BreadcrumbSeparator />
                        {index === breadcrumbs.length - 1 ? (
                            <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink 
                                href="#" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate(crumb.path);
                                }}
                            >
                                {crumb.name}
                            </BreadcrumbLink>
                        )}
                    </BreadcrumbItem>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
