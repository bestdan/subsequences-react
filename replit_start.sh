#!/bin/bash

( cd backend && npm install && node server.js & ) || { echo "Failed to start backend"; exit 1; }

(cd frontend && npm install && npm start) || { echo "Failed to start frontend"; exit 1; }