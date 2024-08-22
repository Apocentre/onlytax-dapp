import {defineConfig} from "vite";
import solid from "vite-plugin-solid";
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
  plugins: [
    solid(),
    nodePolyfills(),
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
