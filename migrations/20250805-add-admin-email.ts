#!/usr/bin/env node

/**
 * migrations/20250805-add-admin-email.js
 *
 * Connects via your existing utils/db, loads the Admin model,
 * and for any admin missing `email`, sets a placeholder
 * `${username}@example.com` and saves.
 */

import mongoose from 'mongoose';
import connect from '../src/utils/db';           // adjust path if needed
import AdminModel from '../src/lib/models/admin'; // adjust path if needed

async function runMigration() {
  // 1) connect to Mongo
  await connect();

  // 2) find admins without email
  const noEmailAdmins = await AdminModel.find({ email: { $exists: false } });

  console.log(`Found ${noEmailAdmins.length} admins missing email.`);

  // 3) backfill each
  for (const admin of noEmailAdmins) {
    const placeholder = `${admin.username}@example.com`;  // ← customize as needed
    admin.email = placeholder;
    try {
      await admin.save();
      console.log(`  ✓ ${admin.username} → ${placeholder}`);
    } catch (err) {
      console.error(`  ✕ failed on ${admin.username}:`, err.message);
    }
  }

  // 4) done
  console.log('Migration complete.');
  mongoose.disconnect();
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
