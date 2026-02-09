/**
 * Seed Script — Create default admin user + FREE30 coupon
 *
 * Usage: node src/scripts/seedAdmin.js
 *
 * Reads ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME from .env
 * If user exists → promotes to admin
 * If not → creates admin user
 * Also creates FREE30 coupon if it doesn't exist
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

async function seed() {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, MONGO_URI } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
        process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // --- Admin User ---
    let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (user) {
        if (user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
            console.log(`Promoted existing user to admin: ${user.email}`);
        } else {
            console.log(`Admin already exists: ${user.email}`);
        }
    } else {
        user = await User.create({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            name: ADMIN_NAME || 'Admin',
            role: 'admin'
        });
        console.log(`Created admin user: ${user.email}`);
    }

    // --- Default Coupon ---
    const existingCoupon = await Coupon.findOne({ code: 'FREE30' });
    if (existingCoupon) {
        console.log(`Coupon FREE30 already exists (${existingCoupon.usedCount}/${existingCoupon.maxUses} used)`);
    } else {
        await Coupon.create({
            code: 'FREE30',
            durationDays: 30,
            maxUses: 100,
            isActive: true,
            createdBy: user._id
        });
        console.log('Created coupon: FREE30 (30 days, 100 max uses)');
    }

    await mongoose.disconnect();
    console.log('Done.');
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
