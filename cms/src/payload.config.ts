import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
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
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " — Essential Bali CMS",
    },
    components: {
      // Show a discreet creds hint under the login form when
      // NEXT_PUBLIC_SHOW_LOGIN_HINT=true. Disable in real prod.
      afterLogin: ["@/components/LoginHint"],
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
  ],
  secret: process.env.PAYLOAD_SECRET || "dev-secret-change-me",
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  sharp,
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
  ],
  csrf: [
    "https://essentialbali.gaiada.online",
    "https://essentialbali.com",
  ],
  // GraphQL is enabled by default at /api/graphql
});
