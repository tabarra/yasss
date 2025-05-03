import index from "./index.html";
Bun.serve({
    routes: {
        "/*": index,
    },
    development: false,
    // development: process.env.NODE_ENV !== "production",
});
