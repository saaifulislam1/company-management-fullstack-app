"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes")); // <-- Import the main router
const app = (0, express_1.default)();
// --- Core Middleware ---
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '16kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '16kb' }));
app.use(express_1.default.static('public'));
// --- Routes ---
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});
// Use the main router for all API routes, prefixed with /api/v1
app.use('/api/v1', routes_1.default); // <-- Add this line
// --- Global Error Handler ---
app.use(errorHandler_1.errorHandler);
exports.default = app;
