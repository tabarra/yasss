import { default as listFilesRoute } from "./routes/listFiles.js";
import { default as downloadRoute } from "./routes/download.js";
import { default as uploadRoute } from "./routes/upload.js";

import fileLogo from "../dist/tmp/logo.svg" with { type: "file" };
import fileHtml from "../dist/tmp/index.html" with { type: "file" };
import fileCss from "../dist/tmp/index.css" with { type: "file" };
import fileJs from "../dist/tmp/index.js" with { type: "file" };

const server = Bun.serve({
    routes: {
        // Import static files
        "/index.css": () => new Response(Bun.file(fileCss)),
        "/index.js": () => new Response(Bun.file(fileJs)),
        "/index.html": () => new Response(Bun.file(fileHtml)),
        "/logo.svg": () => new Response(Bun.file(fileLogo)),

        // Serve index.html for all unmatched routes.
        "/*": () => new Response(Bun.file(fileHtml)),

        // Import all routes
        ...listFilesRoute,
        ...downloadRoute,
        ...uploadRoute,
    },
    development: false,
    // development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 YASSS running at ${server.url}`);
