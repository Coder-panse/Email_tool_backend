require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const templateRoutes = require('./routes/templateRoutes');
const emailRoutes = require('./routes/emailRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/templates', templateRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Bulk Email API is running!');
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connection Successful'))
  .catch((err) => console.log('MongoDB Connection Error: ', err.message));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
