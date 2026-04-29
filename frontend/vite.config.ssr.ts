import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import { FontaineTransform } from "fontaine"

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent"
      }
    }),
    // Match the client config so SSR-emitted CSS includes the same font
    // fallback metrics-overrides (CLS-prevention).
    FontaineTransform.vite({
      fallbacks: ["BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
      resolvePath: (id) => new URL("./public" + id, import.meta.url),
    }),
  ],
  build: {
    ssr: true,
    // ssr: "src/entry-server.tsx",
    outDir: "dist/server",
    rollupOptions: {
      input: {
        front: "src/entry-server.tsx"
      }
    }
  },
  ssr: {
    noExternal: ["react-helmet-async", "quill", "react-quill", "react-quill-new", "stream"]
  }
})
