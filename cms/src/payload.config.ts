import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import nodemailer from "nodemailer";
import sharp from "sharp";

import { Areas } from "./collections/Areas";
import { Topics } from "./collections/Topics";
import { Personas } from "./collections/Personas";
import { Articles } from "./collections/Articles";
import { Media } from "./collections/Media";
import { Comments } from "./collections/Comments";
import { Tags } from "./collections/Tags";
import { HeroAds } from "./collections/HeroAds";
import { Subscribers } from "./collections/Subscribers";
import { Newsletters } from "./collections/Newsletters";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " — Essential Bali CMS",
      icons: [
        { rel: "icon", type: "image/png", url: "/favicon.png" },
      ],
      openGraph: {
        images: [{ url: "/logo.png" }],
      },
    },
    components: {
      // Show a discreet creds hint under the login form when
      // NEXT_PUBLIC_SHOW_LOGIN_HINT=true. Disable in real prod.
      afterLogin: ["@/components/LoginHint"],
      // "Talk to Elliot" sidebar link (after the Collections list).
      afterNavLinks: ["@/components/ElliotNavLink"],
      // Replace the default dashboard with the 8x8 matrix view.
      views: {
        dashboard: {
          Component: "@/components/MatrixDashboard",
        },
        // Talk to Elliot — custom admin route at /admin/elliot
        elliot: {
          Component: "@/components/TalkToElliotView",
          path: "/elliot",
        },
      },
    },
  },
  editor: lexicalEditor(),
  collections: [
    Users,
    Areas,
    Topics,
    Personas,
    Articles,
    Media,
    Comments,
    Tags,
    HeroAds,
    Subscribers,
    Newsletters,
  ],
  secret: process.env.PAYLOAD_SECRET || "dev-secret-change-me",
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  sharp,
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM_ADDRESS || "noreply@gaiada.com",
    defaultFromName: process.env.SMTP_FROM_NAME || "Essential Bali",
    // Skip startup verification — SendGrid creds may be exhausted; verifying
    // at boot blocks the server. Send attempts will surface errors at use-time.
    skipVerify: true,
    transport: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    // For Phase D foundation: auto-push schema instead of using migration files.
    // Switch to migration-based once schema stabilizes.
    push: true,
  }),
  // Headless: keep CORS open to the frontend host(s).
  cors: [
    "https://essentialbali.gaiada.online",
    "https://www.essentialbali.gaiada.online",
    "https://essentialbali.com",
    "https://www.essentialbali.com",
    "http://localhost:3008",
    "http://localhost:5173",
    "https://ess.gaiada0.online",
  ],
  csrf: [
    "https://essentialbali.gaiada.online",
    "https://essentialbali.com",
  ],
  // GraphQL is enabled by default at /api/graphql
});
