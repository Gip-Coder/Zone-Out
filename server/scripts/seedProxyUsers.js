import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";
import Progress from "../src/models/Progress.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PROXY_USERS = [
  { name: "Alice Demo", email: "alice@test.com", password: "Test123!" },
  { name: "Bob Demo", email: "bob@test.com", password: "Test123!" },
  { name: "Carol Demo", email: "carol@test.com", password: "Test123!" },
];

const SUBJECTS = ["Mathematics", "Physics", "Biology", "General"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  for (const u of PROXY_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`User ${u.email} already exists, skipping`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ name: u.name, email: u.email, password: hashed });
    console.log(`Created user: ${u.email}`);
  }

  const users = await User.find({ email: { $in: PROXY_USERS.map((u) => u.email) } });

  for (const user of users) {
    const existingCount = await Progress.countDocuments({ user: user._id });
    if (existingCount > 0) {
      console.log(`Progress for ${user.email} already seeded (${existingCount} entries), skipping`);
      continue;
    }

    const entries = [];
    for (let day = 0; day < 14; day++) {
      const date = getDateDaysAgo(day);
      const sessionsPerDay = Math.floor(Math.random() * 3) + 1;
      for (let s = 0; s < sessionsPerDay; s++) {
        const durationMinutes = [15, 25, 30, 45][Math.floor(Math.random() * 4)];
        const courseName = Math.random() > 0.3 ? randomItem(SUBJECTS) : null;
        entries.push({
          user: user._id,
          type: "focus",
          durationMinutes,
          courseName,
          date,
        });
      }
    }
    await Progress.insertMany(entries);
    console.log(`Seeded ${entries.length} progress entries for ${user.email}`);
  }

  console.log("\n--- Proxy user credentials (use these to test) ---");
  PROXY_USERS.forEach((u) => {
    console.log(`  Email: ${u.email}  |  Password: ${u.password}`);
  });
  console.log("------------------------------------------------\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
