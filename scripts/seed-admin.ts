async function main() {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
  config();

  const bcrypt = (await import("bcryptjs")).default;
  const { connectDB } = await import("../src/lib/db/connect");
  const { default: AdminUser } = await import("../src/lib/models/AdminUser");

  const username = (process.env.ADMIN_SEED_USERNAME ?? "admin").trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD ?? "admin123";

  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI in environment (.env.local or .env).");
    process.exit(1);
  }

  await connectDB();
  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.findOneAndUpdate(
    { username },
    { $set: { username, passwordHash } },
    { upsert: true, new: true },
  );
  console.log(
    `Admin user "${username}" is ready (password from ADMIN_SEED_PASSWORD or default).`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
