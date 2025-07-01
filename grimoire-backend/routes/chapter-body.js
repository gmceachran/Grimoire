const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

let dataCache = {}

// function saveData() {
//   fs.writeFileSync()
// }

router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid Chapter ID' })
    }

    const rootPath = path.join(__dirname, '..')
    const chapterData = path.join(rootPath, `data/chapters/${id}.txt`)

    dataCache = {
      id: id,
      body: fs.readFileSync(chapterData, 'utf-8')
    }
    
    res.json(dataCache)
  } catch (error) {
    console.error('Error loading data.', error)
    dataCache = {}
    res.status(500).json({ error: 'Error loading data' })
  }
})

module.exports = router


