const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '../data/grimoire-data.json');

// Data cache
let dataCache = null;

// Load data into cache
function loadData() {
  try {
    dataCache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (error) {
    console.error('Error loading data:', error);
    dataCache = { name: 'Grimoire' };
  }
}

// Save data to file and update cache
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dataCache, null, 2));
}

// Initialize data on first load
loadData();

// Get the project name
router.get('/name', (req, res) => {
  try {
    if (!dataCache.name) {
      return res.status(404).json({ error: 'Project name not found in data file' });
    }
    res.json(dataCache.name);
  } catch (error) {
    console.error('Error reading project name:', error);
    res.status(500).json({ error: 'Failed to load project name' });
  }
});

// Update the project name
router.post('/name', (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid project name.' });
  }

  dataCache.name = name;
  saveData();
  res.status(200).json({ success: true });
});

module.exports = router; 