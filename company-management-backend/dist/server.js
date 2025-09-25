"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import dotenv to load environment variables from a .env file
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Import the main app logic
const app_1 = __importDefault(require("./app"));
// Define the port the server will run on.
// It tries to get the port from environment variables, otherwise defaults to 8000.
const PORT = process.env.PORT || 8000;
// Start the server and listen for incoming requests on the specified port.
app_1.default.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
