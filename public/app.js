// ========================================
// API LAYER - Server Communication
// ========================================

// Fetch and display all chapters from the server
async function loadChapters() {
  try {
    const res = await fetch('/api/chapters')
    if (!res.ok) throw new Error('Failed to load chapters.') 

    const chapters = await res.json()
    const ul = document.getElementById('contents-list')
    ul.innerHTML = ''

    // Create list items for each chapter
    chapters.forEach(chapter => {
      const li = document.createElement('li')
      const link = document.createElement('a')
      const deleteBtn = document.createElement('button')
    
      link.href = 'chapter.html'
      link.innerText = chapter.name
      link.id = `${chapter.id}-link`

      deleteBtn.innerText = 'Delete'
      deleteBtn.id = `delete-${chapter.id}`
      deleteBtn.className = 'btn'

      li.appendChild(link)
      li.appendChild(deleteBtn)
      ul.appendChild(li)
    })
  } catch (err) {
    alert(err.message)
  }
}

// Create a new chapter and add it to the server
async function addChapter() {
  const input = document.getElementById('input')
  const name = input.value.trim()

  if (!name) {
    alert('Please enter a valid name.')
    return
  }

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

  input.value = ''
  
  // Hide the form after successfully adding a chapter
  const dropdown = document.getElementById('add-chapter-form')
  dropdown.classList.add('hidden')
  
  await loadChapters()
}

// Remove a chapter from the server
async function deleteChapter(id) {
  try {
    const chId = id.replace('delete-', '')
    const res = await fetch(`/api/chapters/${chId}`, {
      method: 'DELETE'
    })

    if (!res.ok) throw new Error('Failed to delete chapter')
    
    loadChapters()
  } catch (err) {
    alert(err.message)
  }
}

// ========================================
// EVENT LISTENERS - User Interactions
// ========================================

// Handle form submission for adding chapters
document.getElementById('add-chapter-form').addEventListener('submit', (e) => {
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
  dropdown.classList.toggle('hidden')
})

// ========================================
// INITIALIZATION
// ========================================

// Load chapters when page loads
loadChapters()