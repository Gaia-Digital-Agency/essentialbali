// VITE CONFIG LOCAL START
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import svgr from "vite-plugin-svgr";

// export default defineConfig({
//   plugins: [
//     react(),
//     svgr({
//       svgrOptions: {
//         icon: true,
//         // This will transform your SVG to a React component
//         exportType: "named",
//         namedExport: "ReactComponent",
//       },
//     }),
//   ],
// });
// VITE CONFIG LOCAL END

// VITE CONFIG SERVER START
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from '@tailwindcss/vite'
import path, {resolve} from "path";

export default defineConfig((args) => {
  const env = loadEnv(args.mode, process.cwd(), '')
  const VITE_HMR = env.VITE_HMR == 'true'
  const VITE_HOST = env.VITE_HOST || '127.0.0.1'
  return {
    root: path.resolve(__dirname),
    plugins: [
      tailwindcss(),
      react(),
      svgr({
	svgrOptions: {
          icon: true,
          // This will transform your SVG to a React component
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
    ],
    optimizeDeps: {
      include: ['react-helmet-async', 'quill', 'react-quill-new']
    },
    ssr: {
      noExternal: ['react-helmet-async', 'quill', 'react-quill-new']
    },
    server: {
      hmr: VITE_HMR,
      host: VITE_HOST,
      port: 5173,
      // Avoid confusion: fail fast if 5173 is taken instead of silently switching to 5174.
      strictPort: true,
      allowedHosts: [env.VITE_ALLOWED_HOST],
      proxy: {
        // Make `/api/*` work from the Vite dev origin (5173) without CORS pain.
        "/api": {
          // Use 127.0.0.1 instead of localhost to avoid DNS/hosts issues.
          target: "http://127.0.0.1:8080",
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: "http://127.0.0.1:8080",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: VITE_HOST,
      port: 5173
    },
    css: {
      postcss: './postcss.config.ts'
    },
    base: env.VITE_BASE_PATH,
    build: {
      // cssCodeSplit: false,
      minify: true,
      outDir: 'dist/client',
      modulePreload: false,
      rollupOptions: {
        input: {
          front: resolve(__dirname, 'src', 'main.html'),
          admin: resolve(__dirname, 'src', 'mainAdmin.html'),
          // css: resolve(__dirname, 'src', 'index.css')
          // critical: resolve(__dirname, 'src', 'index.css'),
          // noncritical: resolve(__dirname, 'src', 'non-critical.css')
          // front: 'main.html',
          // admin: 'mainAdmin.html'
        },
      }
    }
  }
});

// VITE CONFIG SERVER END
