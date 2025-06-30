// ========================================
// API LAYER - Server Communication
// ========================================

// fetch chapter data from server
async function loadChapterData() {
  const urlParams = new URLSearchParam(window.location.search)
  const chapterId = urlParams.get('id')

  const [resChapter, resBody] = await Promise.all([
    fetch('/api/chapters'),
    fetch(`/api/chapter-body/${chapterId}`)
  ])
  const chapter = await resBody.json()

  renderChapterData(chapter)
}

// ========================================
// UI UPDATES 
// ========================================

let chapterText

// return once page right to left flow is handled. 
// This might be a good place to end this branch. or at least commit.
function renderChapterData(chapter) {
  chapterText = chapter
  document.getElementById
}