```
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    
    // Find a user to be the owner, or create a default one
    let owner = await User.findOne({ username: "admin" });
    if (!owner) {
        const newUser = new User({ email: "admin@example.com", username: "admin" });
        // We don't need a real password for the seed owner if we don't login as them
        // But using register is safer with passport-local-mongoose
        owner = await User.register(newUser, "admin123"); 
    }

    initData.data = initData.data.map((obj) => ({ ...obj, owner: owner._id }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
  } catch (err) {
    console.error("Error initializing data:", err);
  }
};

initDB();
```