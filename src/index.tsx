import { serve } from "bun";
import index from "./index.html";

import { default as listFilesRoute } from "./routes/listFiles";
import { default as downloadRoute } from "./routes/download";
import { default as uploadRoute } from "./routes/upload";


const server = serve({
    routes: {
        // Serve index.html for all unmatched routes.
        "/*": index,

        // Import all routes
        ...listFilesRoute,
        ...downloadRoute,
        ...uploadRoute,
    },
    development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 YASSS running at ${server.url}`);
