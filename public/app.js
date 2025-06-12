// make sure this file includes fetch('api/chapters', { method: 'POST' }) when adding chapters.

function addChapter() {
  const ul = document.getElementById('contents-list')
  const chapterName = document.getElementById('name-input').value

  if (!chapterName) {
    alert('Please enter a title.')
    return
  }

  const chapterLink = document.createElement('a')

  chapterLink.href = 'chapter.html'
  chapterLink.id = chapterName
  chapterLink.textContent = chapterName

  ul.appendChild(chapterLink)
  ul.appendChild(document.createElement('br'))
  document.getElementById('name-input').value = ''
}

const button = document.getElementById('add-chapter')
button.addEventListener('click', addChapter)

document.getElementById('name-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addChapter()
  }
})
