function parseFrontMatter(md) {
  let title = '';
  let content = md;
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3);
    if (end !== -1) {
      const frontMatter = md.slice(3, end);
      const titleMatch = frontMatter.match(/title:\s*(.+)/);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
      content = md.slice(end + 4).replace(/^\s+/, '');
    }
  }
  return { title, content };
}

function createCard(title, html) {
  const card = document.createElement('div');
  card.className = 'card';
  
  // 尝试从HTML中提取第一张图片
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const img = tempDiv.querySelector('img');
  
  if (img) {
    card.appendChild(img.cloneNode(true));
    // 移除原文中的图片，避免重复显示
    // tempDiv.removeChild(img); 
    // html = tempDiv.innerHTML;
  }

  const h3 = document.createElement('h3');
  h3.textContent = title;
  card.appendChild(h3);

  const bodyDiv = document.createElement('div');
  bodyDiv.innerHTML = html;
  card.appendChild(bodyDiv);

  return card;
}

function loadAllProjects() {
  const projectFiles = [
    'projects/myfit.md',
    'projects/tcm-heat-care.md',
    'projects/medaesthetic-research.md',
    'projects/health-checkup-industry.md'
  ];

  const container = document.getElementById('content');
  if (!container) return;
  
  // 清空容器并设置为 Grid 布局
  container.innerHTML = '';
  container.className = 'cards'; 

  // 并行加载所有文件
  Promise.all(projectFiles.map(file => 
    fetch(file).then(res => {
      if (!res.ok) throw new Error(`Failed to load ${file}`);
      return res.text();
    })
  ))
  .then(texts => {
    texts.forEach(text => {
      const { title, content } = parseFrontMatter(text);
      const html = marked.parse(content);
      const card = createCard(title, html);
      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error('加载项目失败:', err);
    container.textContent = '项目加载中...';
  });
}

document.addEventListener('DOMContentLoaded', function () {
  loadAllProjects();
});
