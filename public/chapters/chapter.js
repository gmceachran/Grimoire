// ========================================
// API LAYER - Server Communication
// ========================================

// fetch chapter data from server
async function loadChapterData() {
  const urlParams = new URLSearchParams(window.location.search)
  const chapterId = urlParams.get('id')

  const res = await fetch(`/api/chapter-body/${chapterId}`)

  const chatperData = await res.json()
  const chapterText = chatperData.body
  
  renderChapterData(chapterText)
}

// ========================================
// UI UPDATES 
// ========================================

let chapterText

// return once page right to left flow is handled. 
// This might be a good place to end this branch. or at least commit.
function renderChapterData(chapter) {
  const textArea = document.getElementById('text-1')
  textArea.value = chapter
}

loadChapterData()