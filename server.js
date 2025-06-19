const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

const DATA_FILE = path.join(__dirname, 'grimoire-data.json')
const TEMPLATE_FILE = path.join(__dirname, 'grimoire-data.template.json')

// Data cache
let dataCache = null

// Initialize data file from template if it doesn't exist
function initializeDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    if (fs.existsSync(TEMPLATE_FILE)) {
      // Copy from template
      const templateData = fs.readFileSync(TEMPLATE_FILE, 'utf-8')
      fs.writeFileSync(DATA_FILE, templateData)
      console.log('Created data file from template:', DATA_FILE)
    } else {
      // Create with default structure
      const initialData = { chapters: [] }
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2))
      console.log('Created initial data file:', DATA_FILE)
    }
  }
}

// Load data into cache
function loadData() {
  try {
    dataCache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch (error) {
    console.error('Error loading data:', error)
    dataCache = { chapters: [], name: 'Grimoire' }
  }
}

// Save data to file and update cache
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dataCache, null, 2))
}

// Initialize on server start
initializeDataFile()
loadData()

// Get the project name
app.get('/api/name', (req, res) => {
  try {
    if (!dataCache.name) {
      return res.status(404).json({ error: 'Project name not found in data file' })
    }
    res.json(dataCache.name)
  } catch (error) {
    console.error('Error reading project name:', error)
    res.status(500).json({ error: 'Failed to load project name' })
  }
})

// Get all chapters
app.get('/api/chapters', (req, res) => {
  res.json(dataCache.chapters)
})

// Update the project name
app.post('/api/name', (req, res) => {
  const { name } = req.body

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid project name.' })
  }

  dataCache.name = name
  saveData()
  res.status(200).json({ success: true })
})

// Create a new chapter
app.post('/api/chapters', (req, res) => {
  const { name } = req.body

  const newChapter = {
    id: Date.now(),
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    number: `Chapter ${dataCache.chapters.length + 1}`
  }

  dataCache.chapters.push(newChapter)
  saveData()
  res.status(201).json(newChapter)
})

// Delete a chapter by ID
app.delete('/api/chapters/:id', (req, res) => {
  const id = parseInt(req.params.id)
  console.log('Deleting chapter with ID:', id)

  const chapterIndex = dataCache.chapters.findIndex(ch => ch.id === id)
  if (chapterIndex === -1) {
    return res.status(404).json({ error: 'Chapter not found' })
  }

  dataCache.chapters.splice(chapterIndex, 1)

  dataCache.chapters.forEach((chapter, index) => {
    chapter.number = `Chapter ${index + 1}`
  })

  saveData()
  res.status(200).json({ success: true })
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})