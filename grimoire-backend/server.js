const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json())

const DATA_FILE = path.join(__dirname, 'grimoire-data.json')
const TEMPLATE_FILE = path.join(__dirname, 'grimoire-data.template.json')

// Initialize data file from template if it doesn't exist
function initializeDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    if (fs.existsSync(TEMPLATE_FILE)) {
      // Copy from template
      const templateData = fs.readFileSync(TEMPLATE_FILE, 'utf-8')
      fs.writeFileSync(DATA_FILE, templateData)
      console.log('Created data file from template:', DATA_FILE)
    }
  }
}

// Initialize on server start
initializeDataFile()

// Import and use route files
const chaptersRoutes = require('./routes/chapters')
const projectsRoutes = require('./routes/projects')

app.use('/api/chapters', chaptersRoutes)
app.use('/api/projects', projectsRoutes)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})