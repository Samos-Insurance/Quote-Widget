const esbuild = require("esbuild");
const packageJson = require('./package.json');

const env = process.env.BUILD_ENV || "dev";

const BASE_URL =
  env === "prod"
    ? "https://quote.samos.ca"
    : "https://stg.srgry.link";

esbuild.build({
  entryPoints: ["src/widget/quote-widget.js"], 
  bundle: true,
  minify: true,
  outfile: `dist/${env}/v${packageJson.version}/widget.js`,
  define: {
    "process.env.BASE_URL": JSON.stringify(BASE_URL),
    '__VERSION__': `"${packageJson.version}"`,
  },
}).then(() => {
  console.log(`✅ Built ${env} widget at dist/${env}/v${packageJson.version}/widget.js`);
}).catch(() => process.exit(1));