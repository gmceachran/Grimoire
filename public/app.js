// ========================================
// API LAYER - Server Communication
// ========================================

// Fetch and display all chapters from the server
async function loadChapters() {
  try {
    const res = await fetch('/api/chapters')
    if (!res.ok) throw new Error('Failed to load chapters.') 

    const chapters = await res.json()
    renderChapters(chapters)
  } catch (err) {
    alert(err.message)
  }
}

async function loadProjectName() {
  try {
    const res = await fetch('/api/name')
    if (!res.ok) throw new Error('Failed to load Project Name')
    
    const name = await res.json()
    renderName(name)
  } catch (err) {
    alert(err.message)
  }
}

async function updateProjectName(title, inputElement) {
  const name = title.trim()
  if (!name) {
    console.log('Empty title ignored. Retaining previous title.')
    return
  }

  const res = await fetch('/api/name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })

  if (!res.ok) {
    console.error('Failed to update project name')
    return
  }

  hasUnsavedChanges = false
  
  // Defocus the input after successful save
  if (document.activeElement === inputElement) {
    inputElement.blur()
  }
}

// Create a new chapter and add it to the server
async function addChapter() {
  const input = document.getElementById('input')
  const name = input.value.trim()

  const res = await fetch('/api/chapters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })

  if (!res.ok) {
    const err = await res.json()
    alert(err.error || 'Failed to add chapter.')
    return
  }

  const chapter = await res.json()
  input.value = ''
  
  // Hide the form after successfully adding a chapter
  const dropdown = document.getElementById('add-chapter-form')
  dropdown.classList.add('hidden')

  addChapterToList(chapter)
}

// Remove a chapter from the server
async function deleteChapter(id) {
  try {
    const chapterId = id.replace('delete-', '')
    const res = await fetch(`/api/chapters/${chapterId}`, {
      method: 'DELETE'
    })

    if (!res.ok) throw new Error('Failed to delete chapter')
    
    deleteChapterFromList(chapterId)
  } catch (err) {
    alert(err.message)
  }
}

// ========================================
// UI UPDATES - from session memory
// ========================================

let chapters = []
let hasUnsavedChanges = false
let suppressInputEvent = false
const ul = document.getElementById('contents-list')

function createChapterListItem(chapter) {
  const li = document.createElement('li')
  li.id = `chapter-${chapter.id}`
  
  const link = document.createElement('a')
  link.href = 'chapter.html'
  link.id = `${chapter.id}-link`
  link.className = 'chapter-link'

  const chapterNum = document.createElement('span')
  chapterNum.className = 'chapter-num'
  chapterNum.innerText = chapter.number

  const chapterName = document.createElement('span')
  chapterName.className = 'chapter-name'
  chapterName.innerText = chapter.name

  link.appendChild(chapterNum)
  link.appendChild(chapterName)

  const deleteBtn = document.createElement('button')
  deleteBtn.innerText = 'Delete'
  deleteBtn.id = `delete-${chapter.id}`
  deleteBtn.className = 'btn'

  li.appendChild(link)
  li.appendChild(deleteBtn)

  return li
}


function renderChapters(serverChapters) {
  chapters = serverChapters
  ul.innerHTML = ''

  chapters.forEach(chapter => {
    const li = createChapterListItem(chapter)
    ul.appendChild(li)
  })
}

function renderName(name) {
  const input = document.getElementById('project-title')
  suppressInputEvent = true
  input.value = name
  suppressInputEvent = false
}

function addChapterToList(chapter) {
  chapters.push(chapter)
  const li = createChapterListItem(chapter)
  ul.appendChild(li)
}

function deleteChapterFromList(chapterId) {
  const numericChapterId = parseInt(chapterId)
  
  chapters = chapters.filter(ch => ch.id !== numericChapterId)

  const deleteBtn = document.querySelector(`#delete-${chapterId}`)
  if (deleteBtn && deleteBtn.parentElement) {
    deleteBtn.parentElement.remove()
  }

  // Renumber remaining chapters and update DOM
  chapters.forEach((chapter, index) => {
    chapter.number = `Chapter ${index + 1}`
    
    // Update the chapter number in the DOM using getElementById
    const chapterElement = document.getElementById(`chapter-${chapter.id}`)
    const numberSpan = chapterElement.querySelector('.chapter-num')
    numberSpan.textContent = chapter.number
  })
 }

// ========================================
// EVENT LISTENERS - User Interactions
// ========================================

// Handles title input post request on timeout
let debounceTimer

document.getElementById('project-title').addEventListener('input', (e) => {
  if (suppressInputEvent) return
  
  hasUnsavedChanges = true
  const title = e.target.value
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    updateProjectName(title, e.target)
  }, 3000)
})

window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault()
    return ''
  }
})

// Handle form submission for adding chapters
document.getElementById('add-chapter-form').addEventListener('click', (e) => {
  e.preventDefault()
  addChapter()
})

// Allow Enter key to submit the form
document.getElementById('input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    addChapter()
  }
})

// Handle delete button clicks on chapter list
document.getElementById('contents-list').addEventListener('click', (e) => {
  const target = e.target
  if (target.tagName === 'BUTTON') deleteChapter(target.id)
})

// Toggle the add chapter form visibility
document.getElementById('form-trigger').addEventListener('click', (e) => {
  const dropdown = document.getElementById('add-chapter-form')
  const input = document.getElementById('input')
  dropdown.classList.toggle('hidden')
  input.focus()
})

// ========================================
// INITIALIZATION
// ========================================

// Load chapters when page loads
loadProjectName()
loadChapters()