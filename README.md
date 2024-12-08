# Subsequences

Subsequences is a web app for playing a game based on Consequences. 

Players submit a text and a story is generated based on the text.

# Eng stuff

Frontend is built with [Create React App](https://create-react-app.dev/) in `/frontend`.

Backend is minimized with [express](https://expressjs.com/) in `/backend`.

First, run the development server:

```bash
node backend/server.js
npm start
```
#!/bin/bash

( cd backend && npm install && PORT=$BACKEND_PORT node server.js & ) || { echo "Failed to start backend"; exit 1; }

(cd frontend && npm install && npm start) || { echo "Failed to start frontend"; exit 1; }

#!/bin/bash

( cd backend && npm install && PORT=$BACKEND_PORT node server.js & ) || { echo "Failed to start backend"; exit 1; }

(cd frontend && npm install && npm run build) || { echo "Failed to start frontend"; exit 1; }
