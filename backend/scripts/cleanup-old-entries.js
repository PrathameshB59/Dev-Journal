// Script to delete old entries without userId (pre-authentication entries)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function cleanupOldEntries() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get Entry model
        const Entry = require('../src/models/Entry');

        // Count entries without userId
        const countBefore = await Entry.countDocuments({ userId: { $exists: false } });
        console.log(`Found ${countBefore} entries without userId`);

        if (countBefore === 0) {
            console.log('No old entries to delete. Database is clean.');
            await mongoose.disconnect();
            return;
        }

        // Delete entries without userId
        const result = await Entry.deleteMany({ userId: { $exists: false } });
        console.log(`Deleted ${result.deletedCount} old entries`);

        // Verify cleanup
        const countAfter = await Entry.countDocuments({ userId: { $exists: false } });
        console.log(`Entries without userId remaining: ${countAfter}`);

        // Show total entries remaining
        const totalEntries = await Entry.countDocuments({});
        console.log(`Total entries in database: ${totalEntries}`);

        await mongoose.disconnect();
        console.log('Cleanup complete!');
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupOldEntries();
