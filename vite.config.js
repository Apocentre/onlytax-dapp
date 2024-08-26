import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {nodePolyfills} from "vite-plugin-node-polyfills";
import EnvironmentPlugin from "vite-plugin-environment";
import daisyui from "daisyui";

export default defineConfig({
  content: {
    files: ["./index.html", "./src/view/**/*.jsx"],
  },
  theme: {
    extend: {},
  },
  define: {
    "process.env": process.env,
    //"process.env.version" : '3.5',
    "process.browser": true,
    // // By default, Vite doesn't include shims for NodeJS/
    // // necessary for segment analytics lib to work
    //"Buffer": Buffer,
    global: {},
  },
  plugins: [
    nodePolyfills(),
    react(),
    EnvironmentPlugin("all"),
    daisyui,
  ],
  server: {
    port: 3010,
  },
  build: {
    target: "esnext",
  },
})
