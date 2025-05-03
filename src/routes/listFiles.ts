import { Glob, type BunRequest } from "bun";
import fsp from 'node:fs/promises';
import path from "node:path";
import ignore from "ignore";

const rootDir = process.cwd();

const defaultIgnoreRules = [
    'node_modules',
    'dist',
    '.git',
];

//Attempt to find a .gitignore file in the root directory
const getIgnorer = async () => {
    let gitIgnore = ''
    try {
        gitIgnore = await Bun.file(path.join(rootDir, '.gitignore')).text();
    } catch (error) {
        console.log('could not read .gitignore');
    }
    return ignore().add(defaultIgnoreRules).add(gitIgnore);
}


export type ScandirFileEntry = {
    dir: false;
    path: string;
    name: string;
    modified: number;
    size: number;
}
export type ScandirDirEntry = {
    dir: true;
    path: string;
    name: string;
}
export type ScandirDatum = ScandirFileEntry | ScandirDirEntry;


const listFilesRoute = async (req: BunRequest) => {
    const url = new URL(req.url);
    const directoryPath = url.searchParams.get("path") || "";
    
    // Sanitize the path to prevent directory traversal
    const normalizedPath = path.normalize(directoryPath);
    if (normalizedPath.startsWith("..")) {
        return new Response("Invalid path", { status: 400 });
    }
    
    const fullPath = path.join(rootDir, normalizedPath);
    
    // Check if directory exists
    try {
        const stat = await fsp.stat(fullPath);
        if (!stat.isDirectory()) {
            return new Response("Not a directory", { status: 400 });
        }
    } catch (error) {
        return new Response("Directory not found", { status: 404 });
    }

    try {
        const ignore = await getIgnorer();
        const results: ScandirDatum[] = [];
        
        // Read directory contents
        const entries = await fsp.readdir(fullPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const entryPath = path.join(normalizedPath, entry.name);
            const relPath = path.relative(rootDir, path.join(fullPath, entry.name));
            
            // Skip if ignored
            if (ignore.ignores(relPath)) continue;
            
            if (entry.isDirectory()) {
                results.push({
                    dir: true,
                    path: entryPath,
                    name: entry.name
                });
            } else if (entry.isFile()) {
                const stat = await fsp.stat(path.join(fullPath, entry.name));
                results.push({
                    dir: false,
                    path: entryPath,
                    name: entry.name,
                    modified: stat.mtime.getTime(),
                    size: stat.size,
                });
            }
        }
        
        console.log('[LIST]', results.length);
        return Response.json(results);
    } catch (error) {
        console.error("Error reading directory:", error);
        return new Response("Error reading directory", { status: 500 });
    }
};

export default {
    '/api/listFiles': listFilesRoute,
}
