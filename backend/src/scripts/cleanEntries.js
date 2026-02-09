/**
 * Database cleanup script — Delete old test entries
 * Usage: node src/scripts/cleanEntries.js [--all|--before=YYYY-MM-DD]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Entry = require('../models/Entry');

async function clean() {
    const args = process.argv.slice(2);
    const deleteAll = args.includes('--all');
    const beforeArg = args.find(arg => arg.startsWith('--before='));

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let query = {};
    let description = '';

    if (deleteAll) {
        description = 'ALL entries';
    } else if (beforeArg) {
        const dateStr = beforeArg.split('=')[1];
        const date = new Date(dateStr);
        query = { createdAt: { $lt: date } };
        description = `entries before ${dateStr}`;
    } else {
        console.log('Usage:');
        console.log('  npm run clean:entries -- --all              (delete all entries)');
        console.log('  npm run clean:entries -- --before=2026-01-01 (delete before date)');
        process.exit(0);
    }

    const count = await Entry.countDocuments(query);
    console.log(`Found ${count} ${description} to delete`);

    if (count > 0) {
        const result = await Entry.deleteMany(query);
        console.log(`Deleted ${result.deletedCount} entries`);
    }

    await mongoose.disconnect();
    console.log('Done.');
}

clean().catch(err => {
    console.error('Cleanup failed:', err.message);
    process.exit(1);
});
