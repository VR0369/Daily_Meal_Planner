import mongoose from 'mongoose';

/**
 * Connect to MongoDB.
 *
 * If MONGO_URI is provided we connect to that (local or Atlas).
 * If it is missing we spin up an in-memory MongoDB via mongodb-memory-server so
 * the app runs instantly with zero database setup. This keeps the project
 * "production-ready" (real Mongoose models, real queries) while remaining
 * trivial to demo.
 */
let memoryServer = null;

export async function connectDB() {
  mongoose.set('strictQuery', true);

  let uri = process.env.MONGO_URI;

  if (!uri) {
    // Lazy import so the dependency is only loaded when actually needed.
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('mealplanner');
    console.log('⚠️  No MONGO_URI set — using in-memory MongoDB (data is not persisted).');
  }

  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  return { uri, usingMemoryServer: Boolean(memoryServer) };
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export function isUsingMemoryServer() {
  return Boolean(memoryServer);
}
