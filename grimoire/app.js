 function addChapter() { 
  const ul = document.getElementById('contents-list');
  const chapterName = document.getElementById('chapter-name').value;
  const chapterLink = document.createElement('a');
  
  chapterLink.href = 'chapter.html';
  chapterLink.id = chapterName;
  chapterLink.textContent = chapterName;
 
  ul.appendChild(chapterLink);
  ul.appendChild(document.createElement('br'));
  document.getElementById('chapter-name').value = '';
 };

 const button = document.getElementById('add-chapter');
 button.addEventListener('click', addChapter);
