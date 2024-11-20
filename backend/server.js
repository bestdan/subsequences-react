const express = require('express');
const cors = require('cors');
const sessionRoutes = require('./routes/sessions');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sessions', sessionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 