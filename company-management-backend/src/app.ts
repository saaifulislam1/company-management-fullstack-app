import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import mainRouter from './routes'; // <-- Import the main router

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

// Use the main router for all API routes, prefixed with /api/v1
app.use('/api/v1', mainRouter); // <-- Add this line

// --- Global Error Handler ---
app.use(errorHandler);

export default app;
