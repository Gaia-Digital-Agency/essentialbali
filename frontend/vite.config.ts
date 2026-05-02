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
import { visualizer } from 'rollup-plugin-visualizer'
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
      // Optional bundle audit. Run with: BUNDLE_AUDIT=1 pnpm build:ssr
      // Generates dist/stats.html with a treemap of every module +
      // its byte cost in raw / gzip / brotli. No effect when env var
      // is unset, so this is free in normal builds.
      ...(process.env.BUNDLE_AUDIT === '1'
        ? [visualizer({
            filename: 'dist/stats.html',
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: 'treemap',
          })]
        : []),
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
        output: {
          // Better cache + parallelism: split heavy vendor deps into their
          // own chunks so they cache forever (deps rarely change), let HTTP/2
          // multiplex fetching, and shrink the per-page critical bundle.
          manualChunks: (id) => {
            if (!id.includes('node_modules')) return undefined;
            // React + Router + ReactDOM — every page needs these, keep
            // together so they share React's runtime symbol table.
            if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
              return 'vendor-react';
            }
            // rsuite — the 552 KB villain pre-F4. Only used by Deals +
            // EventsV2/V3 (all React.lazy'd routes). Splitting means the
            // homepage never pays for it; only operators visiting an
            // event/deals page download it (then cache forever).
            if (/[\\/]node_modules[\\/](rsuite|@rsuite)[\\/]/.test(id)) {
              return 'vendor-rsuite';
            }
            // date-fns — granular ESM but Vite groups them all into the
            // misc chunk by default. Splitting keeps it cache-stable.
            if (/[\\/]node_modules[\\/](date-fns)[\\/]/.test(id)) {
              return 'vendor-datefns';
            }
            // Apex charts + jvectormap — big visualization deps used only
            // by the admin/ecommerce dashboards. Public site shouldn't
            // ship them; isolate so the lazy chunks reference them only.
            if (/[\\/]node_modules[\\/](apexcharts|react-apexcharts|@react-jvectormap)[\\/]/.test(id)) {
              return 'vendor-charts';
            }
            // Lucide icon set — tree-shakeable per-icon but the chunk-
            // YQSHRJWW.mjs entry was 217 KB pre-F4 (icon barrel).
            if (/[\\/]node_modules[\\/](lucide-react)[\\/]/.test(id)) {
              return 'vendor-lucide';
            }
            // GSAP is used only for hover/scroll animations on a few
            // components (Image, Button, MobileMenu, SearchBar).
            if (/[\\/]node_modules[\\/](gsap|@gsap)[\\/]/.test(id)) {
              return 'vendor-gsap';
            }
            // Quill rich-text editor (still bundled via index.css's
            // legacy ql-* hooks; physically tree-shaken from F5 but the
            // package is referenced through "noExternal" so the runtime
            // pulls in the type defs at minimum).
            if (/[\\/]node_modules[\\/](quill|react-quill-new)[\\/]/.test(id)) {
              return 'vendor-quill';
            }
            // Swiper carousel — large, only some pages use it.
            if (/[\\/]node_modules[\\/](swiper)[\\/]/.test(id)) {
              return 'vendor-swiper';
            }
            // Everything else from node_modules → vendor-misc.
            // Should now be much smaller — Helmet, axios, clsx, lodash,
            // jwt-decode, slugify and friends. Re-evaluate if it grows.
            return 'vendor-misc';
          },
        },
      }
    }
  }
});

// VITE CONFIG SERVER END
