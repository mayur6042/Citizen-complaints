const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost:27017/complaintsDB"; // Change if needed

mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Drop only the complaints collection
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    if (collectionNames.includes("complaints")) {
      await mongoose.connection.db.dropCollection("complaints");
      console.log("🗑 Complaints collection dropped successfully");
    } else {
      console.log("⚠ Complaints collection does not exist, nothing to drop");
    }

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
