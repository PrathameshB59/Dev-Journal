/**
 * Migration Script: Flat Entries → Hierarchical Virtual Filesystem
 *
 * Converts the existing flat entry model (title, category) into a
 * hierarchical virtual filesystem (name, type, parentId).
 *
 * What this does:
 * 1. For each user, creates category folders at root level
 * 2. Moves existing entries into their matching category folder
 * 3. Sets type='file' for entries, type='folder' for category folders
 * 4. Copies title → name for all entries
 *
 * Safe to run multiple times (idempotent).
 *
 * Usage: node scripts/migrate-to-filesystem.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

// Category → folder name mapping
const CATEGORY_FOLDERS = {
    'daily-learning': { name: 'Daily Learning', icon: '📘' },
    'project-note':   { name: 'Project Notes', icon: '📁' },
    'bug-fix':        { name: 'Bug Fixes', icon: '🐛' },
    'code-snippet':   { name: 'Code Snippets', icon: '💻' },
    'concept':        { name: 'Concepts', icon: '💡' }
};

async function migrate() {
    console.log('=== Virtual Filesystem Migration ===\n');

    // Connect to MongoDB
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`Connected to: ${conn.connection.host}`);

    const db = conn.connection.db;
    const entriesCol = db.collection('entries');

    // Get all distinct userIds
    const userIds = await entriesCol.distinct('userId');
    console.log(`Found ${userIds.length} user(s) to migrate\n`);

    let totalMigrated = 0;
    let totalFoldersCreated = 0;

    for (const userId of userIds) {
        console.log(`--- Migrating user: ${userId} ---`);

        // Check if this user already has folders (idempotent check)
        const existingFolders = await entriesCol.countDocuments({
            userId: userId,
            type: 'folder'
        });

        if (existingFolders > 0) {
            console.log(`  User already has ${existingFolders} folders. Skipping folder creation.`);
        }

        // Create category folders for this user (if they don't exist)
        const folderMap = {}; // category-slug → folder _id

        for (const [slug, info] of Object.entries(CATEGORY_FOLDERS)) {
            // Check if folder already exists
            let folder = await entriesCol.findOne({
                userId: userId,
                type: 'folder',
                name: info.name,
                parentId: null
            });

            if (!folder) {
                const result = await entriesCol.insertOne({
                    name: info.name,
                    type: 'folder',
                    parentId: null,
                    mime: 'folder',
                    pinned: true,
                    favorite: false,
                    content: '',
                    tags: [],
                    userId: userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                folderMap[slug] = result.insertedId;
                totalFoldersCreated++;
                console.log(`  Created folder: ${info.name}`);
            } else {
                folderMap[slug] = folder._id;
                console.log(`  Folder exists: ${info.name}`);
            }
        }

        // Find all entries that haven't been migrated yet
        // (entries without 'type' field, or entries with category but no parentId)
        const unmigrated = await entriesCol.find({
            userId: userId,
            type: { $ne: 'folder' },
            $or: [
                { type: { $exists: false } },
                { type: null },
                { type: 'file', parentId: { $exists: false } },
                { type: 'file', parentId: null, category: { $exists: true, $ne: null, $ne: '' } }
            ]
        }).toArray();

        console.log(`  Found ${unmigrated.length} entries to migrate`);

        for (const entry of unmigrated) {
            const updates = {};

            // Copy title → name if name doesn't exist
            if (!entry.name && entry.title) {
                updates.name = entry.title;
            } else if (!entry.name && !entry.title) {
                updates.name = 'Untitled';
            }

            // Set type to file
            updates.type = 'file';

            // Set parentId based on category
            if (entry.category && folderMap[entry.category]) {
                updates.parentId = folderMap[entry.category];
            }

            // Set defaults for new fields
            if (entry.pinned === undefined) updates.pinned = false;
            if (entry.favorite === undefined) updates.favorite = false;
            if (entry.mime === undefined) updates.mime = 'text/markdown';

            updates.updatedAt = new Date();

            await entriesCol.updateOne(
                { _id: entry._id },
                { $set: updates }
            );
            totalMigrated++;
        }

        console.log(`  Migrated ${unmigrated.length} entries\n`);
    }

    console.log('=== Migration Complete ===');
    console.log(`Folders created: ${totalFoldersCreated}`);
    console.log(`Entries migrated: ${totalMigrated}`);
    console.log(`Total users processed: ${userIds.length}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
