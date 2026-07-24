const express = require('express');
const cors = require('cors');
const path = require('path');
const fileRoutes = require('./routes/fileRoutes');
const authRoutes = require('./routes/authRoutes');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', fileRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('BBSec File Store backend is running');
});

initDb();

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
