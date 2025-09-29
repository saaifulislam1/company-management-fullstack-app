#!/bin/sh

# This script is the entrypoint for the Docker container.
# It ensures database migrations are applied before starting the main application.

echo "Running database migrations..."
# Run the Prisma migration deploy command.
# The 'npx' command executes the Prisma CLI installed in node_modules.
npx prisma migrate deploy

echo "Starting the server..."
# The 'exec "$@"' command executes any command that was passed to the script.
# In our docker-compose.yml, this will be "node dist/server.js".
# 'exec' replaces the shell process with the server process, which is a best practice.
exec "$@"