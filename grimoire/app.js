 function addChapter() {
  // need to add code to check that chapterName isn't the same text as an already existing chapter and isn't an empty string
  // also ideally have a default Chapter i, determined by how many chapters already exist. 
  const ul = document.getElementById('contents-list');
  const chapterName = document.getElementById('chapter-name').value;
  const chapterLink = document.createElement('a');

  chapterLink.href = 'chapter.html';
  chapterLink.id = chapterName;
  chapterLink.textContent = chapterName;

  ul.appendChild(chapterLink);
 };

 const button = document.getElementById('add-chapter');
 button.addEventListener('click', addChapter);

 // so the next thing I need to figure out is how to add individual chapters with their own pages
 // this is query param stuff, I think, essentially a page following a default format that is differentiated from other pages with it's own id

// I also need to start thinking about how to set up a database, So I can start saving chapters