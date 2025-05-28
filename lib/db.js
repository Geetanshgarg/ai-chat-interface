import mongoose from 'mongoose';

// Get the MongoDB URI from environment variables with a fallback
const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ollama-chat';

// Connection options
const CONNECTION_OPTIONS = {
  bufferCommands: false,
  // Add additional options for better stability
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Check if we have a global instance cached
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If there's an active connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no active connection or promise yet, create one
  if (!cached.promise) {
    // Log connection attempt
    console.log(`Connecting to MongoDB: ${URI.replace(/\/\/([^:]+):([^@]+)@/, '//**:**@')}`); // Hide credentials in logs

    cached.promise = mongoose.connect(URI, CONNECTION_OPTIONS)
      .then((mongoose) => {
        console.log('Connected to MongoDB successfully!');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Reset the promise so that next call to dbConnect will try again
    cached.promise = null;
    throw error;
  }
}

export default dbConnect;
