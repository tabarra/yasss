import { type BunRequest } from "bun";
import path from "node:path";
import fs from "node:fs";

const rootDir = process.cwd();

const uploadRoute = async (req: BunRequest) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }
    
    try {
        // Parse the multipart form data
        const formData = await req.formData();
        const files = formData.getAll("files");
        const uploadPath = formData.get("path") as string || ""; // Default to root directory
        
        // Sanitize the upload path to prevent directory traversal
        const normalizedPath = path.normalize(uploadPath);
        if (normalizedPath.startsWith("..")) {
            return new Response("Invalid upload path", { status: 400 });
        }
        
        const targetDir = path.join(rootDir, normalizedPath);
        
        // Check if the target directory exists, create it if not
        try {
            await fs.promises.access(targetDir);
        } catch (error) {
            await fs.promises.mkdir(targetDir, { recursive: true });
        }
        
        const results = [];
        
        // Process each file
        for (const file of files) {
            if (!(file instanceof File)) {
                results.push({
                    name: "unknown",
                    error: "Not a file"
                });
                continue;
            }
            
            try {
                const fileName = file.name;
                const filePath = path.join(targetDir, fileName);
                
                // Convert the file to an ArrayBuffer and write it to disk
                const buffer = await file.arrayBuffer();
                await Bun.write(filePath, buffer);
                
                results.push({
                    name: fileName,
                    size: file.size,
                    success: true
                });
            } catch (error) {
                results.push({
                    name: file.name,
                    error: String(error)
                });
            }
        }
        
        console.log('[UPLOAD]', results.map(r => r.name));
        return Response.json({
            success: true,
            message: `${results.filter(r => r.success).length} files uploaded successfully`,
            results
        });
    } catch (error) {
        console.error("Upload error:", error);
        return new Response("Error uploading files", { status: 500 });
    }
};

export default {
    '/api/upload': uploadRoute,
}; 
