import 'dotenv/config';
import mongoose from 'mongoose';
import { Organization } from '../src/v2/models.js';
import { User, Farmer, Labour, Purchase, Payment, Stock, Truck } from '../src/models.js';
// Assign legacy records only. Never infer ledger entries, quantities, paid balances, or duplicate opening stock.
await mongoose.connect(process.env.MONGODB_URI);
const models = [User, Farmer, Labour, Purchase, Payment, Stock, Truck];
const report = {};
for (const Model of models) report[Model.modelName] = { total: await Model.countDocuments(), unassigned: await Model.countDocuments({ organizationId: null }) };
console.log(JSON.stringify({ mode: process.argv.includes('--apply') ? 'apply' : 'dry-run', collections: report }, null, 2));
if (process.argv.includes('--apply')) {
  if (!process.env.MIGRATION_ORGANIZATION_ID || !process.env.BACKUP_VERIFIED_AT) throw new Error('Set MIGRATION_ORGANIZATION_ID and BACKUP_VERIFIED_AT after a tested backup restore.');
  if (!await Organization.exists({ _id: process.env.MIGRATION_ORGANIZATION_ID })) throw new Error('Create and verify the target organization first.');
  await mongoose.connection.transaction(async session => {
    for (const Model of models) await Model.updateMany({ organizationId: null }, { $set: { organizationId: process.env.MIGRATION_ORGANIZATION_ID } }, { session });
  });
  console.log('Organization assignment complete. Legacy financial records remain read-only; reconcile opening balances separately.');
}
await mongoose.disconnect();
