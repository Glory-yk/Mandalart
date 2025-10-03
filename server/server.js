
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

app.get('/api/data', (req, res) => {
  fs.readFile(DB_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading from db.json:', err);
      return res.status(500).json({ message: 'Error reading data' });
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/data', (req, res) => {
  const data = req.body;
  fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing to db.json:', err);
      return res.status(500).json({ message: 'Error saving data' });
    }
    res.json({ message: 'Data saved successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
