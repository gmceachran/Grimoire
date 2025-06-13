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
      link.href = 'chapter.html'
      link.id = chapter.id
      link.textContent = chapter.name
      li.appendChild(link)
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
    alert(err.error || 'Failed to load chapters.')
    return
  }

  input.value = ''
  loadChapters()
}

document.getElementById('add-chapter').addEventListener('click', addChapter)
document.getElementById('input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addChapter()
})

loadChapters()