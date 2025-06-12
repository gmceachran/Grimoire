const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

const DATA_FILE = path.join(__dirname, 'grimoire-data.json')

app.get('/api/chapters', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  res.json(data.chapters)
})

app.post('/api/chapters', (req, res) => {
  const { name } = req.body

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid Chapter name.' })
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))

  const exists = data.chapters.some((ch) => ch.name === name)
  if (exists) {
    return res.status(409).json({ error: 'Chapter already exists.' })
  }

  const newChapter = {
    id: `ch${data.chapters.length + 1}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-')
  }

  data.chapters.push(newChapter)
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  res.status(201).json(newChapter)
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})