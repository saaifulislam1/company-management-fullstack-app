import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler'; // Import the error handler

const app: Application = express();

// --- Core Middleware ---
app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));

// --- Routes ---
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

// --- TODO: Add API routes here ---

// --- Global Error Handler ---
// This middleware must be placed AT THE END, after all other routes and middleware.
// It will catch any errors that are passed to `next()` from anywhere in the app.
app.use(errorHandler);

export default app;
