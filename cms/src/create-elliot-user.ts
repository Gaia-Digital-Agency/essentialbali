/**
 * Create (or rotate) the Elliot AI agent user in Payload, with an API key.
 *
 * Run:   pnpm tsx src/create-elliot-user.ts
 * Env:   ELLIOT_EMAIL, ELLIOT_PASSWORD (optional — defaults below)
 *
 * Outputs the API key that should be plumbed into .openclaw-ess.
 */
import { getPayload } from "payload";
import config from "./payload.config.js";
import crypto from "crypto";

const EMAIL = process.env.ELLIOT_EMAIL || "elliot@gaiada.com";
const PASSWORD = process.env.ELLIOT_PASSWORD || crypto.randomBytes(24).toString("hex");
const NEW_API_KEY = process.env.ELLIOT_API_KEY || crypto.randomBytes(32).toString("hex");

async function main() {
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: EMAIL } },
    limit: 1,
  });

  let userId: number | string;
  if (existing.docs.length) {
    userId = existing.docs[0].id;
    // Rotate the API key
    const updated = await payload.update({
      collection: "users",
      id: userId,
      data: {
        role: "ai-agent",
        name: "Elliot",
        enableAPIKey: true,
      } as any,
    });
    console.log(`✓ updated existing AI agent user id=${userId} email=${EMAIL}`);
  } else {
    const created = await payload.create({
      collection: "users",
      data: {
        email: EMAIL,
        password: PASSWORD,
        role: "ai-agent",
        name: "Elliot",
        enableAPIKey: true,
      } as any,
    });
    userId = created.id;
    console.log(`✓ created AI agent user id=${userId} email=${EMAIL}`);
  }

  // Force a fresh API key (we control the plaintext value here)
  await payload.update({
    collection: "users",
    id: userId,
    data: { apiKey: NEW_API_KEY } as any,
  });

  console.log("");
  console.log("=== ELLIOT API CREDENTIALS ===");
  console.log("Email:    ", EMAIL);
  console.log("Password: ", existing.docs.length ? "(unchanged)" : PASSWORD);
  console.log("API Key:  ", NEW_API_KEY);
  console.log("");
  console.log("Auth header for Elliot:");
  console.log(`  Authorization: users API-Key ${NEW_API_KEY}`);
  console.log("");

  // Smoke test: hit /api/users/me with the key
  const port = process.env.PORT || 4008;
  try {
    const probe = await fetch(`http://127.0.0.1:${port}/api/users/me`, {
      headers: { Authorization: `users API-Key ${NEW_API_KEY}` },
    });
    const data = await probe.json().catch(() => ({}));
    console.log(`Smoke test /api/users/me → HTTP ${probe.status}`);
    console.log(`  user.email: ${(data as any)?.user?.email}`);
    console.log(`  user.role:  ${(data as any)?.user?.role}`);
  } catch (e) {
    console.log("Smoke test failed (server probably not running yet):", e);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ failed:", err);
  process.exit(1);
});
