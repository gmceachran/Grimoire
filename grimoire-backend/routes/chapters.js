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
    dataCache = { chapters: [] };
  }
}

// Save data to file and update cache
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dataCache, null, 2));
}

// Initialize data on first load
loadData();

// Get all chapters
router.get('/', (req, res) => {
  res.json(dataCache.chapters);
});

// Create a new chapter
router.post('/', (req, res) => {
  const { name } = req.body;

  const newChapter = {
    id: Date.now(),
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    number: `Chapter ${dataCache.chapters.length + 1}`
  };

  const chaptersDir = path.join(__dirname, '../data/chapters')
  const CHAPTER_DATA = path.join(chaptersDir, `${newChapter.id}.txt`)
  
  // Create chapters directory if it doesn't exist
  if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true })
  }
  
  fs.writeFileSync(CHAPTER_DATA, '')

  dataCache.chapters.push(newChapter);
  saveData();
  res.status(201).json(newChapter);
});

// Delete a chapter by ID
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const chapterIndex = dataCache.chapters.findIndex(ch => ch.id === id);
  if (chapterIndex === -1) {
    return res.status(404).json({ error: 'Chapter not found' });
  }

  const chapterToDelete = dataCache.chapters[chapterIndex];
  const chaptersDir = path.join(__dirname, '../data/chapters');
  const chapterFilePath = path.join(chaptersDir, `${chapterToDelete.id}.txt`);

  // Delete the chapter file if it exists
  if (fs.existsSync(chapterFilePath)) {
    fs.unlinkSync(chapterFilePath);
  }

  dataCache.chapters.splice(chapterIndex, 1);

  dataCache.chapters.forEach((chapter, index) => {
    chapter.number = `Chapter ${index + 1}`;
  });

  saveData();
  res.status(200).json({ success: true });
});

module.exports = router; 