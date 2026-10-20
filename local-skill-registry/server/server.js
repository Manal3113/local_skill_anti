const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const Worker = require('./models/Worker');
const { seedDatabase } = require('./seed');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with generous origin support for local development and preview
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    project: 'Local Skill Registry',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/contact-requests', require('./routes/contactRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Serve client in production build if client/dist exists
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // Fallback message if frontend isn't built yet
      res.status(200).json({
        message: 'Local Skill Registry API is running. Start the client via Vite.',
        health: '/api/health',
        workers: '/api/workers',
      });
    }
  });
});

// 404 Route Handler for undefined API paths
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found.`,
  });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start Server after connecting to MongoDB
let serverInstance = null;

const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
    console.log('[Server] HTTP server closed.');
  }
  const { closeDB } = require('./config/db');
  await closeDB();
  setTimeout(() => {
    process.exit(0);
  }, 500);
};



process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.once('SIGUSR2', async () => {
  console.log('\n[Server] Nodemon restart triggered (SIGUSR2). Cleaning connections...');
  const { closeDB } = require('./config/db');
  await closeDB();
  process.kill(process.pid, 'SIGUSR2');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server Alert] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[Server Alert] Uncaught Exception:', error);
});

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is currently empty
    if (global.dbConnected) {
      const workerCount = await Worker.countDocuments();
      if (workerCount === 0) {
        console.log('[Server Startup] Database is empty. Seeding realistic sample workers & requests...');
        await seedDatabase(false);
      } else {
        console.log(`[Server Startup] Database initialized with ${workerCount} existing worker records.`);
      }
    } else {
      console.log(`[Server Startup] Database is offline. Skipping seeding...`);
    }

    serverInstance = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  Local Skill Registry API running on port ${PORT}`);
      console.log(`  Health: http://localhost:${PORT}/api/health`);
      console.log(`  Workers API: http://localhost:${PORT}/api/workers`);
      console.log(`====================================================`);
    });
    return serverInstance;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start if executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, gracefulShutdown };

