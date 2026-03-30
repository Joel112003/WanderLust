const mongoose = require("mongoose");
require("dotenv").config();

async function setupDatabase() {
  try {

    await mongoose.connect(process.env.ATLAS_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

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
