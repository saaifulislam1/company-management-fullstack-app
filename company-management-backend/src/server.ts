// Import dotenv to load environment variables from a .env file
import dotenv from 'dotenv';
dotenv.config();

// Import the main app logic
import app from './app';

// Define the port the server will run on.
// It tries to get the port from environment variables, otherwise defaults to 8000.
const PORT = process.env.PORT || 8000;

// Start the server and listen for incoming requests on the specified port.
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
