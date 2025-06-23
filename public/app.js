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

// Create a list item element for a chapter
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

  li.appendChild(link)

  return li
}

// Create a context menu for chapter options
function createContextMenu(listId, x, y) {
  const id = listId.replace('chapter-', '')

  const menu = document.createElement('div')
  const deleteBtn = document.createElement('button')

  menu.setAttribute('role', 'menu')
  menu.setAttribute('aria-label', 'Chapter options menu')
  menu.className = 'context-menu'

  deleteBtn.innerText = 'Delete Chapter'
  deleteBtn.id = `delete-${id}`
  menu.appendChild(deleteBtn)

  menu.style.position = 'fixed'
  menu.style.left = `${x}px`
  menu.style.top = `${y}px`

  return menu
}

function createConfirmationModal(deleteId) {
  const background = document.createElement('div')
  background.className = 'background'

  const modal = document.createElement('div')
  modal.className = 'confirmation-modal'
  modal.id = 'confirmation-modal'

  const confirmDialogue = document.createElement('span')
  confirmDialogue.className = 'confirm-dialogue'
  confirmDialogue.innerText = 'Are you sure you want to delete this chapter?'

  const btnSection = document.createElement('span')

  const deleteBtn = document.createElement('button')
  deleteBtn.className = 'delete confirmation-button'
  deleteBtn.innerText = 'Delete'
  deleteBtn.id = deleteId

  const cancelBtn = document.createElement('button')
  cancelBtn.className = 'cancel confirmation-button'
  cancelBtn.innerText = 'Cancel'

  btnSection.appendChild(cancelBtn)
  btnSection.appendChild(deleteBtn)

  modal.appendChild(confirmDialogue)
  modal.appendChild(btnSection)

  modal.style.position = 'fixed'
  modal.style.left = '50%'
  modal.style.top = '50%'
  modal.style.transform = 'translate(-50%, -50%)'

  // Add the background to the DOM and put modal inside it
  document.body.appendChild(background)
  background.appendChild(modal)

  return background
}

// Render all chapters in the list
function renderChapters(serverChapters) {
  chapters = serverChapters
  ul.innerHTML = ''

  chapters.forEach(chapter => {
    const li = createChapterListItem(chapter)
    ul.appendChild(li)
  })
}

// Render the project name in the title input
function renderName(name) {
  const input = document.getElementById('project-title')
  suppressInputEvent = true
  input.value = name
  suppressInputEvent = false
}

// Add a new chapter to the list
function addChapterToList(chapter) {
  chapters.push(chapter)
  const li = createChapterListItem(chapter)
  ul.appendChild(li)
}

// Remove a chapter from the list and renumber remaining chapters
function deleteChapterFromList(chapterId) {
  const numericChapterId = parseInt(chapterId)
  chapters = chapters.filter(ch => ch.id !== numericChapterId)

  const deprecatedChapter = document.getElementById(`chapter-${chapterId}`)
  if (deprecatedChapter) deprecatedChapter.remove()
  

  chapters.forEach((chapter, index) => {
    chapter.number = `Chapter ${index + 1}`
 
    const chapterElement = document.getElementById(`chapter-${chapter.id}`)
    const numberSpan = chapterElement.querySelector('.chapter-num')
    numberSpan.textContent = chapter.number
  })
}

function clearContextMenu() {
  const existingMenus = document.querySelectorAll('.context-menu')
  existingMenus.forEach(menu => menu.remove())
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
document.getElementById('add-chapter').addEventListener('click', (e) => {
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

// Handle delete context menu for li
document.getElementById('contents-list').addEventListener('contextmenu', (e) => {
  clearContextMenu()
  const target = e.target.closest('li')
  if (!target) return

  e.preventDefault()
  const menu = createContextMenu(target.id, e.clientX, e.clientY)
  document.body.appendChild(menu)
})
document.addEventListener('click', (e) => {
  if (!e.target.closest('.context-menu')) {
    clearContextMenu()
  }
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    clearContextMenu()
  }
})
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    clearContextMenu()
  }
})
document.addEventListener('scroll', (e) => {
  clearContextMenu()
})

// Context Menu Delete Button
document.addEventListener('click', (e) => {
  const contextMenu = e.target.closest('.context-menu')
  if (!contextMenu) return

  const target = e.target.closest('button')
  if (!target) return

  const background = createConfirmationModal(target.id)
  clearContextMenu()
})

// Handle cancel and delete modal buttons
document.addEventListener('click', (e) => {
  const modal = e.target.closest('#confirmation-modal')
  if (!modal) return

  const target = e.target.closest('button')
  if (!target) return

  if (target.className.includes('delete')) {
    deleteChapter(target.id)
    modal.parentElement.remove() // Remove the background (which contains the modal)
  } else if (target.className.includes('cancel')) {
    modal.parentElement.remove() // Remove the background (which contains the modal)
  }
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