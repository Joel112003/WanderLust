const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (_) {
  // Ignore if DNS override is not allowed in this environment.
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectWithRetry(uri, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(uri);
      return;
    } catch (error) {
      const isLastTry = attempt === retries;
      console.error(`MongoDB connect attempt ${attempt}/${retries} failed: ${error.message}`);
      if (isLastTry) throw error;
      await sleep(1500 * attempt);
    }
  }
}

async function setupDatabase() {
  try {
    if (!process.env.ATLAS_DB) {
      throw new Error("ATLAS_DB is missing in backend/.env");
    }

    await connectWithRetry(process.env.ATLAS_DB, 4);

    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    console.log("Creating geospatial index for listings...");
    try {
      await db
        .collection("listings")
        .createIndex({ "geometry.coordinates": "2dsphere" });
      console.log("✅ Geospatial index created for listings");
    } catch (error) {
      console.log("⚠️ Geospatial index may already exist:", error.message);
    }

    console.log("Creating indexes for bookings...");
    try {
      await db
        .collection("bookings")
        .createIndex({ listing: 1, status: 1, checkIn: 1 });
      await db.collection("bookings").createIndex({ user: 1, status: 1 });
      await db
        .collection("bookings")
        .createIndex({ status: 1, checkIn: 1, checkOut: 1 });
      console.log("✅ Booking indexes created");
    } catch (error) {
      console.log("⚠️ Booking indexes may already exist:", error.message);
    }

    console.log("Creating indexes for cancellations...");
    try {
      await db.collection("cancellations").createIndex({ listing: 1, timestamp: -1 });
      await db.collection("cancellations").createIndex({ owner: 1, timestamp: -1 });
      console.log("✅ Cancellation indexes created");
    } catch (error) {
      console.log("⚠️ Cancellation indexes may already exist:", error.message);
    }

    console.log("Creating indexes for reports...");
    try {
      await db
        .collection("reports")
        .createIndex({ ticketNumber: 1 }, { unique: true });
      await db.collection("reports").createIndex({ reporter: 1, createdAt: -1 });
      await db.collection("reports").createIndex({ booking: 1 });
      await db.collection("reports").createIndex({ listing: 1 });
      await db.collection("reports").createIndex({ status: 1, severity: -1 });
      console.log("✅ Report indexes created");
    } catch (error) {
      console.log("⚠️ Report indexes may already exist:", error.message);
    }

    console.log("Creating indexes for alternative bookings...");
    try {
      await db
        .collection("alternativebookings")
        .createIndex({ originalBooking: 1 });
      await db
        .collection("alternativebookings")
        .createIndex({ status: 1, expiresAt: 1 });
      console.log("✅ Alternative booking indexes created");
    } catch (error) {
      console.log("⚠️ Alternative booking indexes may already exist:", error.message);
    }

    console.log("\n🎉 Database setup completed successfully!\n");

    console.log("📊 Index Summary:");
    const collections = [
      "listings",
      "bookings",
      "cancellations",
      "reports",
      "alternativebookings",
    ];

    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).indexes();
        console.log(`\n${collectionName}:`);
        indexes.forEach((index) => {
          console.log(`  - ${JSON.stringify(index.key)}`);
        });
      } catch (error) {
        console.log(`  Collection ${collectionName} may not exist yet`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
