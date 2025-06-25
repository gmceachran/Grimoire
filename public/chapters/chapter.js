// ========================================
// API LAYER - Server Communication
// ========================================

// fetch chapter data from server
async function loadChapterData() {
  const urlParams = new URLSearchParam(window.location.search)
  const chapterId = urlParams.get('id')

  const res = await fetch(`/api/chapters/${chapterId}`)
  const chapter = await res.json()

  renderChapterData(chapter)
}

// ========================================
// UI UPDATES 
// ========================================

function renderChapterData(chapter) {}