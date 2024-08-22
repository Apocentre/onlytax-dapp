import {defineConfig} from "vite";
import solid from "vite-plugin-solid";
import {nodePolyfills} from "vite-plugin-node-polyfills";
import EnvironmentPlugin from "vite-plugin-environment";

export default defineConfig({
  plugins: [solid(), nodePolyfills(), EnvironmentPlugin("all")],
  server: {
    port: 3010,
  },
  build: {
    target: "esnext",
  },
})
