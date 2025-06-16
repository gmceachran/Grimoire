async function loadChapters() {
  try {
    const res = await fetch('/api/chapters')
    if (!res.ok) throw new Error('Failed to load chapters.') 

    const chapters = await res.json()
    const ul = document.getElementById('contents-list')
    ul.innerHTML = ''

    chapters.forEach(chapter => {
      const li = document.createElement('li')
      const link = document.createElement('a')
      const deleteBtn = document.createElement('button')
    
      link.href = 'chapter.html'
      link.innerText = chapter.name
      link.id = `${chapter.id}-link`

      deleteBtn.innerText = 'Delete'
      deleteBtn.id = `delete-${chapter.id}`
      deleteBtn.style.marginTop = '10px'
      deleteBtn.style.marginLeft = '10px'

      li.appendChild(link)
      li.appendChild(deleteBtn)
      ul.appendChild(li)
    })
  } catch (err) {
    alert(err.message)
  }
}

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
  loadChapters()
}

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

document.getElementById('add-chapter').addEventListener('click', addChapter)
document.getElementById('input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addChapter()
})
document.getElementById('contents-list').addEventListener('click', (e) => {
  const target = e.target
  if (target.tagName === 'BUTTON') deleteChapter(target.id)
})

loadChapters()