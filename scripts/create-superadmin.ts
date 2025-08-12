// scripts/create-superadmin.ts
import 'dotenv/config';
import connect from '../src/utils/db';
import AdminModel from '../src/lib/models/admin';
import { hashPassword } from '../src/lib/auth/admin/password';

async function main() {
  await connect();

  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error('Usage: ts-node scripts/create-superadmin.ts <username> <password>');
    process.exit(1);
  }

  const existing = await AdminModel.findOne({ username: username.toLowerCase().trim() });
  if (existing) {
    console.log(`Admin with username "${username}" already exists.`);
    process.exit(0);
  }

  const hashed = await hashPassword(password);
  const superadmin = new AdminModel({
    username: username.toLowerCase().trim(),
    password: hashed,
    role: 'superadmin'
  });

  await superadmin.save();

  console.log('Superadmin created:', {
    id: superadmin._id.toString(),
    username: superadmin.username
  });

  process.exit(0);
}

main().catch(err => {
  console.error('Error creating superadmin:', err);
  process.exit(1);
});
