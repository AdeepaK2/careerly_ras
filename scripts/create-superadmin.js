// scripts/create-superadmin.js
require("dotenv/config");
const connect = require("../src/utils/db").default;
const AdminModel = require("../src/lib/models/admin").default;
const { hashPassword } = require("../src/lib/auth/admin/password");

async function main() {
  await connect();

  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error(
      "Usage: node scripts/create-superadmin.js <username> <password>"
    );
    process.exit(1);
  }

  const existing = await AdminModel.findOne({
    username: username.toLowerCase().trim(),
  });
  if (existing) {
    console.log(`Admin with username "${username}" already exists.`);
    process.exit(0);
  }

  const hashed = await hashPassword(password);
  const superadmin = new AdminModel({
    username: username.toLowerCase().trim(),
    password: hashed,
    role: "superadmin",
  });

  await superadmin.save();

  console.log("Superadmin created:", {
    id: superadmin._id.toString(),
    username: superadmin.username,
  });

  process.exit(0);
}

main().catch((err) => {
  console.error("Error creating superadmin:", err);
  process.exit(1);
});
