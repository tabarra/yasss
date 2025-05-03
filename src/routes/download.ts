import { type BunRequest } from "bun";
import path from "node:path";
import fs from "node:fs";

const rootDir = process.cwd();

const downloadRoute = async (req: BunRequest) => {
    const url = new URL(req.url);
    const filePath = url.searchParams.get("path");
    
    if (!filePath) {
        return new Response("Missing file path", { status: 400 });
    }
    
    try {
        // Sanitize the file path to prevent directory traversal
        const normalizedPath = path.normalize(filePath);
        if (normalizedPath.startsWith("..")) {
            return new Response("Invalid file path", { status: 400 });
        }
        
        const fullPath = path.join(rootDir, normalizedPath);
        
        // Check if the file exists
        try {
            const stat = await fs.promises.stat(fullPath);
            if (!stat.isFile()) {
                return new Response("Not a file", { status: 400 });
            }
        } catch (error) {
            return new Response("File not found", { status: 404 });
        }
        
        // Read the file as a buffer
        const file = Bun.file(fullPath);
        const buffer = await file.arrayBuffer();
        
        // Set appropriate headers for downloading
        const headers = new Headers();
        headers.set("Content-Type", file.type || "application/octet-stream");
        headers.set("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`);
        headers.set("Content-Length", String(file.size));
        
        console.log('[DOWNLOAD]', fullPath);
        return new Response(buffer, {
            headers
        });
    } catch (error) {
        console.error("Download error:", error);
        return new Response("Error downloading file", { status: 500 });
    }
};

export default {
    '/api/download': downloadRoute,
}; 
