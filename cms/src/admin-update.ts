import { getPayload } from "payload";
import config from "./payload.config.js";

const NEW_EMAIL = process.env.NEW_ADMIN_EMAIL || "super_admin@email.com";
const NEW_PASS = process.env.NEW_ADMIN_PASSWORD || "Teameditor@123";

async function main() {
  const payload = await getPayload({ config });

  // Find existing user with this email
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: NEW_EMAIL } },
    limit: 1,
  });

  if (existing.docs.length) {
    const id = existing.docs[0].id;
    await payload.update({
      collection: "users",
      id,
      data: { password: NEW_PASS, role: "admin", name: "Super Admin" },
    });
    console.log(`✓ updated existing admin id=${id} email=${NEW_EMAIL}`);
  } else {
    const created = await payload.create({
      collection: "users",
      data: {
        email: NEW_EMAIL,
        password: NEW_PASS,
        role: "admin",
        name: "Super Admin",
      },
    });
    console.log(`✓ created new admin id=${created.id} email=${NEW_EMAIL}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ failed:", err);
  process.exit(1);
});
