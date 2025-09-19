import express, { Application, Request, Response } from 'express';
import cors from 'cors';

// Create an instance of the Express application
const app: Application = express();

// --- Core Middleware ---

// Enable Cross-Origin Resource Sharing (CORS) for all routes.
// This allows your frontend (on a different domain) to make requests to this backend.
app.use(cors());

// Parse incoming JSON payloads. This is crucial for POST/PATCH requests.
// The `limit` option prevents overly large payloads from crashing the server.
app.use(express.json({ limit: '16kb' }));

// Parse URL-encoded payloads (e.g., from HTML forms).
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Serve static files (like images) from the 'public' directory.
app.use(express.static('public'));

// --- Routes ---

// A simple health check route to confirm the server is running.
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

// --- TODO: Add API routes here ---

// --- TODO: Add Global Error Handler here ---

// Export the app instance to be used by server.ts
export default app;
