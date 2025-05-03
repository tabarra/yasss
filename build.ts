#!/usr/bin/env bun
import plugin from "bun-plugin-tailwind";
import fs from "node:fs";
import path from "path";
import bytes from "bytes";

const outdir = "./dist";

// Clean the outdir
if (fs.existsSync(outdir)) {
    console.log(`🗑️ Cleaning previous build at ${outdir}`);
    await fs.promises.rm(outdir, { recursive: true, force: true });
}

// Build all the HTML files
const tmpdir = path.join(outdir, "tmp");
fs.mkdirSync(tmpdir, { recursive: true });
const result1 = await Bun.build({
    entrypoints: ["./src/index.html"],
    outdir: tmpdir,
    plugins: [plugin],
    minify: true,
    target: "browser",
    sourcemap: "linked",
    define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
    },
    naming: {
        asset: "[dir]/[name].[ext]",
        chunk: "[dir]/[name].[ext]",
        entry: "[dir]/[name].[ext]",
    },
});
const outputTable = result1.outputs.map(output => ({
    "File": path.relative(process.cwd(), output.path),
    "Type": output.kind,
    "Size": bytes(output.size),
}));
console.table(outputTable);

//copy logo to dist
fs.copyFileSync('./src/logo.svg', path.join(tmpdir, "logo.svg"));

// Building binaries
const targets = {
    'bun-windows-x64': 'yasss-windows-x64.exe',
    'bun-linux-x64': 'yasss-linux-x64',
    'bun-linux-arm64': 'yasss-linux-arm64',
    'bun-darwin-x64': 'yasss-darwin-x64',
    'bun-darwin-arm64': 'yasss-darwin-arm64',
    'bun-linux-x64-musl': 'yasss-linux-x64-musl',
    'bun-linux-arm64-musl': 'yasss-linux-arm64-musl',
}
const entrypoint = './src/index-build-bin.ts';
for (const [target, filename] of Object.entries(targets)) {
    const outfile = path.join(outdir, filename);
    console.log(`⏳ Building ${filename}...`);
    //need to use the cli because Bun.build() doesn't support the `--compile` mode
    await Bun.$`bun build --compile --minify --sourcemap --bytecode --target ${target} --outfile ${outfile} ${entrypoint}`;
}

console.log(`✅ Done!`);
