// build.js
const esbuild = require("esbuild");
const packageJson = require('./package.json');

const env = process.env.BUILD_ENV || "dev";

const BASE_URL = process.env.BASE_URL; 

if (!BASE_URL) {
  console.error("❌ ERROR: BASE_URL environment variable is missing! Build aborted.");
  process.exit(1);
}

esbuild.build({
  // Tell esbuild to take the source file and output it to TWO different locations
  entryPoints: [
    { out: `${env}/v${packageJson.version}/widget`, in: "src/widget/quote-widget.js" }, // For S3 CDN
    { out: `npm/widget`, in: "src/widget/quote-widget.js" } // For NPM Users
  ],
  bundle: true,
  minify: true,
  outdir: "dist", // Base output directory
  define: {
    "process.env.BASE_URL": JSON.stringify(BASE_URL),
    '__VERSION__': `"${packageJson.version}"`,
  },
}).then(() => {
  console.log(`✅ Built ${env} widget for CDN (v${packageJson.version}) and NPM`);
}).catch(() => process.exit(1));