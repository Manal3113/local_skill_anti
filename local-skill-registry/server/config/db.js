const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const startLocalMongoProcess = () => {
  const binPath = path.join(__dirname, '../bin/mongod.exe');
  const dbPath = path.join(__dirname, '../data/db');
  const logPath = path.join(__dirname, '../data/mongod.log');

  if (fs.existsSync(binPath)) {
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }
    console.log('[Database] Starting local MongoDB engine from server/bin/mongod.exe...');
    const child = spawn(
      binPath,
      ['--dbpath', dbPath, '--port', '27017', '--bind_ip', '127.0.0.1', '--logpath', logPath],
      { detached: true, stdio: 'ignore' }
    );
    child.unref();
    return true;
  }
  return false;
};

const connectDB = async (retry = true) => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/local_skill_registry';
    
    console.log(`[Database] Attempting to connect to MongoDB...`);
    console.log(`[Database] URI: ${mongoUri.replace(/:([^:@]{3,})@/, ':****@')}`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
    global.dbConnected = true;
    
    mongoose.connection.on('error', err => {
      console.error(`[Database Error] Connection lost or encountered an error:`, err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[Database Warning] MongoDB disconnected. Mongoose will try to reconnect automatically.`);
    });

    return conn;
  } catch (err) {
    const isLocal = !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('127.0.0.1') || process.env.MONGODB_URI.includes('localhost');
    if (retry && isLocal && (err.message.includes('ECONNREFUSED') || err.message.includes('Server selection timed out'))) {
      const started = startLocalMongoProcess();
      if (started) {
        console.log('[Database] Waiting for local MongoDB engine to initialize...');
        await new Promise(r => setTimeout(r, 2500));
        return connectDB(false);
      }
    }

    console.error(`\n========================================================`);
    console.error(`❌ [Database Error] Could not connect to MongoDB!`);
    console.error(`========================================================`);
    console.error(`Details: ${err.message}`);
    console.error(`========================================================\n`);
    
    global.dbConnected = false;
    global.dbError = err.message;
    return null;
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed.');
  } catch (err) {
    console.error('[Database Error] Error closing connection:', err.message);
  }
};

connectDB.connectDB = connectDB;
connectDB.closeDB = closeDB;

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.closeDB = closeDB;
