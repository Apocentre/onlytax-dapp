import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import EnvironmentPlugin from "vite-plugin-environment"
import {nodePolyfills} from "vite-plugin-node-polyfills"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills(),
    react(),
    EnvironmentPlugin('all'),
  ]
})
