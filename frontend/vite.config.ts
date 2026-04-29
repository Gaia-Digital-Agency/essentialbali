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
import { FontaineTransform } from 'fontaine'
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
      // Generate fallback @font-face metrics-overrides so the system font
      // used while Inter/Playfair load matches their metrics — eliminates
      // the body/footer text reflow on web-font swap that was driving CLS
      // ≈ 1.4 even with logo dimensions locked.
      FontaineTransform.vite({
        fallbacks: ['BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        resolvePath: (id) => new URL('./public' + id, import.meta.url),
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
          target: "http://127.0.0.1:8082",
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: "http://127.0.0.1:8082",
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
          // admin entry removed in cleanup-D — mainAdmin.html, mainAdmin.tsx,
          // entry-server-admin.tsx, AdminApp.tsx, and pages/Master/* deleted.
          // /admin is served by Payload at :4008 via nginx allowlist; the
          // legacy admin bundle is no longer built.
        },
      }
    }
  }
});

// VITE CONFIG SERVER END
