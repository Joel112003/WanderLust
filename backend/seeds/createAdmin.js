require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/user');

const dbUrl = process.env.ATLAS_DB ;


const createAdminUser = async () => {
    try {
        await mongoose.connect(dbUrl);
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: "admin" });
        if (existingAdmin) {
            console.log("Admin user already exists!");
            return;
        }

        // Create admin user
        const adminUser = new User({
            username: "Joel2025",
            email: "Joel2025@wanderlust.com",
            isAdmin: true
        });

        // Register the user with passport
        await User.register(adminUser, "Joel@12345");

        console.log("\n=== Admin User Created Successfully ===");
        console.log("Username: admin");
        console.log("Email: admin@wanderlust.com");
        console.log("Password: admin123");
        console.log("=====================================\n");
    } catch (error) {
        console.error("Error creating admin user:", error);
    } finally {
        await mongoose.connection.close();
    }
};

createAdminUser();