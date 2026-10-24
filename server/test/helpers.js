import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod;

/** Starts an isolated in-memory MongoDB; tests never touch a real database. */
export async function startDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

export async function stopDb() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

export async function clearDb() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

export const tokenFor = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

export const newUserId = () => new mongoose.Types.ObjectId().toString();
