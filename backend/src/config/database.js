import mongoose from 'mongoose';

let isConnected = false;
let memoryServer = null;

async function setupMemoryServer() {
  console.log('🔄  Attempting to initialize local in-memory MongoDB instance for development...');
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    isConnected = true;
    console.log('✨  In-Memory MongoDB server running successfully!');

    // Auto-seed
    console.log('🌱  Auto-seeding initial database records for demo...');
    try {
      const { seedInitialData } = await import('../utils/seedData.js');
      await seedInitialData();
      console.log('🎉  Initial seed data populated into in-memory database!');
    } catch (seedErr) {
      console.warn('Seeding note:', seedErr.message);
    }
    return true;
  } catch (err) {
    console.warn('⚠️  Could not launch mongodb-memory-server:', err.message);
    return false;
  }
}

export async function connectDB() {
  let uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<password>')) {
    console.log('ℹ️  No valid MONGODB_URI found in environment.');
    return await setupMemoryServer();
  }

  try {
    // Attempt connecting to MongoDB Atlas with a 6-second timeout
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
    isConnected = true;
    console.log(`✅  MongoDB Atlas connected: ${mongoose.connection.host}`);
    try {
      const { seedInitialData } = await import('../utils/seedData.js');
      await seedInitialData();
    } catch (seedErr) {
      console.warn('Init note:', seedErr.message);
    }
    return true;
  } catch (err) {
    console.warn(`⚠️  MongoDB Atlas connection failed: ${err.message}`);
    console.warn('👉  Atlas cluster may require IP Whitelisting (0.0.0.0/0).');
    return await setupMemoryServer();
  }
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected gracefully');
  }
  if (memoryServer) {
    await memoryServer.stop();
  }
}

export function getConnectionStatus() {
  return isConnected;
}
