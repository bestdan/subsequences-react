#!/bin/bash

( cd backend && npm install && PORT=$BACKEND_PORT node server.js & ) || { echo "Failed to start backend"; exit 1; }

(cd frontend && npm install && npm run build) || { echo "Failed to start frontend"; exit 1; }