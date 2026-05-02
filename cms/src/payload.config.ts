import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { gcsStorage } from "@payloadcms/storage-gcs";
import nodemailer from "nodemailer";
import sharp from "sharp";
import { readFileSync } from "node:fs";

const ALLOWED_ORIGINS: string[] = JSON.parse(
  readFileSync("/var/www/essentialbali/shared/allowed-origins.json", "utf-8"),
);

import { Areas } from "./collections/Areas";
import { Topics } from "./collections/Topics";
import { Personas } from "./collections/Personas";
import { Articles } from "./collections/Articles";
import { Media } from "./collections/Media";
import { Comments } from "./collections/Comments";
import { Tags } from "./collections/Tags";
import { HeroAds } from "./collections/HeroAds";
import { HeroAdVersions } from "./collections/HeroAdVersions";
import { Subscribers } from "./collections/Subscribers";
import { Newsletters } from "./collections/Newsletters";
import { HomeDailyFeed } from "./collections/HomeDailyFeed";
import { Users } from "./collections/Users";
import { NewsletterNotice } from "./globals/NewsletterNotice";

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
    HeroAdVersions,
    Subscribers,
    Newsletters,
    HomeDailyFeed,
  ],
  globals: [
    NewsletterNotice,
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
  // GCS bucket for all media uploads. Falls back to local disk when
  // GCS_BUCKET env is not set (dev / first-run).
  ...(process.env.GCS_BUCKET
    ? {
        plugins: [
          gcsStorage({
            bucket: process.env.GCS_BUCKET,
            options: {
              projectId: process.env.GCP_PROJECT_ID || "gda-viceroy",
              keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            },
            collections: {
              media: {
                // Public-read bucket — Payload returns the GCS URL directly
                // so the public site can hot-link without a signed URL.
                disablePayloadAccessControl: true,
              },
            },
          }),
        ],
      }
    : {}),
  // CORS + CSRF — single source of truth at
  // /var/www/essentialbali/shared/allowed-origins.json. Express SSR
  // reads the same file at boot. To add/remove a host: edit that JSON,
  // then restart both pm2 processes.
  cors: ALLOWED_ORIGINS,
  csrf: ALLOWED_ORIGINS.filter(
    (o) =>
      o.startsWith("https://essentialbali") ||
      o === "http://localhost:4008", // admin via SSH tunnel
  ),
  // GraphQL is enabled by default at /api/graphql
});
