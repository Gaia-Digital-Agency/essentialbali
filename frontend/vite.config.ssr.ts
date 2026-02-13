import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent"
      }
    })
  ],
  build: {
    ssr: true,
    // ssr: "src/entry-server.tsx",
    outDir: "dist/server",
    rollupOptions: {
      input: {
        front: "src/entry-server.tsx",
        admin: "src/entry-server-admin.tsx"
      }
    }
  },
  ssr: {
    noExternal: ["react-helmet-async", "quill", "react-quill", "react-quill-new", "stream"]
  }
})
