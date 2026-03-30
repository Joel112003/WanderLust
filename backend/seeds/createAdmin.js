const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/user');

dns.setDefaultResultOrder('ipv4first');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {
}

const dbUrl = process.env.ATLAS_DB ;

const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || "admin";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@wanderlust.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";
const RESET_ADMIN_PASSWORD = process.env.SEED_RESET_ADMIN_PASSWORD === 'true';
const PROMOTE_EXISTING_USER = process.env.SEED_PROMOTE_EXISTING_USER === 'true';

const createAdminUser = async () => {
    try {
        if (!dbUrl) {
            throw new Error('ATLAS_DB is missing. Check backend/.env and connection string.');
        }

        await mongoose.connect(dbUrl);

        const existingAdmin = await User.findOne({
            isAdmin: true,
            $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }]
        });
        if (existingAdmin) {
            if (RESET_ADMIN_PASSWORD) {
                await existingAdmin.setPassword(ADMIN_PASSWORD);
                await existingAdmin.save();
                console.log("Admin user already existed, password has been reset.");
                console.log(`Username: ${existingAdmin.username}`);
                console.log(`Email: ${existingAdmin.email}`);
                console.log(`New Password: ${ADMIN_PASSWORD}`);
                return;
            }

            console.log("Admin user already exists!");
            console.log(`Username: ${existingAdmin.username}`);
            console.log(`Email: ${existingAdmin.email}`);
            console.log("Tip: set SEED_RESET_ADMIN_PASSWORD=true in backend/.env to reset password.");
            return;
        }

        const conflictingUser = await User.findOne({
            $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }]
        });

        if (conflictingUser) {
            if (PROMOTE_EXISTING_USER) {
                conflictingUser.isAdmin = true;
                if (RESET_ADMIN_PASSWORD) {
                    await conflictingUser.setPassword(ADMIN_PASSWORD);
                }
                await conflictingUser.save();

                console.log("Existing user promoted to admin successfully.");
                console.log(`Username: ${conflictingUser.username}`);
                console.log(`Email: ${conflictingUser.email}`);
                if (RESET_ADMIN_PASSWORD) {
                    console.log(`New Password: ${ADMIN_PASSWORD}`);
                }
                return;
            }

            console.log("User exists with same username/email but is not an admin.");
            console.log(`Username: ${conflictingUser.username}`);
            console.log(`Email: ${conflictingUser.email}`);
            console.log("No changes made for safety.");
            console.log("To promote this user intentionally, set SEED_PROMOTE_EXISTING_USER=true.");
            return;
        }

        const adminUser = new User({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            isAdmin: true
        });

        await User.register(adminUser, ADMIN_PASSWORD);

        console.log("\n=== Admin User Created Successfully ===");
        console.log(`Username: ${ADMIN_USERNAME}`);
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);
        console.log("=====================================\n");
    } catch (error) {
        console.error("Error creating admin user:", error);
    } finally {
        await mongoose.connection.close();
    }
};

createAdminUser();
