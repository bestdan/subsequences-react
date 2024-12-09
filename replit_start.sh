#!/bin/bash

(cd frontend && npm install && npm start) || { echo "Failed to start frontend"; exit 1; }

( cd backend && npm install && PORT=$BACKEND_PORT node server.js & ) || { echo "Failed to start backend"; exit 1; }
