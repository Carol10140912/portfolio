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
  
  // 1. 卡片头部（图标 + 标题）
  const header = document.createElement('div');
  header.className = 'card-header';
  
  const iconDiv = document.createElement('div');
  iconDiv.className = 'card-icon';
  // 根据标题关键词分配不同的医疗图标
  let iconClass = 'fa-file-medical'; // 默认图标
  if (title.includes('体重') || title.includes('运动')) iconClass = 'fa-heart-pulse';
  else if (title.includes('医美') || title.includes('光电')) iconClass = 'fa-wand-magic-sparkles';
  else if (title.includes('护理') || title.includes('中医')) iconClass = 'fa-hand-holding-medical';
  else if (title.includes('调研') || title.includes('行业')) iconClass = 'fa-chart-line';
  
  iconDiv.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
  
  const h3 = document.createElement('h3');
  h3.className = 'card-title';
  h3.textContent = title;
  
  header.appendChild(iconDiv);
  header.appendChild(h3);
  card.appendChild(header);

  // 解析HTML以分离摘要和详情
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // 2. 提取摘要（第一段文字）
  const firstP = tempDiv.querySelector('p');
  let summaryText = '';
  if (firstP) {
    summaryText = firstP.textContent;
    // 从临时DOM中移除第一段，剩下的作为详情
    tempDiv.removeChild(firstP);
  }

  const summaryDiv = document.createElement('div');
  summaryDiv.className = 'card-summary';
  summaryDiv.textContent = summaryText;
  card.appendChild(summaryDiv);

  // 3. 详细内容容器（默认隐藏）
  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'card-details';
  detailsDiv.innerHTML = tempDiv.innerHTML; // 剩余的所有内容
  card.appendChild(detailsDiv);

  // 4. 展开/收起按钮
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'card-toggle';
  toggleBtn.innerHTML = '进一步了解 <i class="fa-solid fa-chevron-down"></i>';
  
  toggleBtn.onclick = function() {
    const isExpanded = card.classList.contains('expanded');
    if (isExpanded) {
      card.classList.remove('expanded');
      toggleBtn.innerHTML = '进一步了解 <i class="fa-solid fa-chevron-down"></i>';
    } else {
      card.classList.add('expanded');
      toggleBtn.innerHTML = '收起详情 <i class="fa-solid fa-chevron-up"></i>';
    }
  };
  
  card.appendChild(toggleBtn);

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

  // 并行加载所有文件，添加时间戳避免缓存
  Promise.all(projectFiles.map(file => 
    fetch(`${file}?v=${Date.now()}`).then(res => {
      if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status} ${res.statusText}`);
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
    container.innerHTML = `<div style="text-align:center; padding: 20px; color: red;">
      <p>项目加载失败，请刷新重试。</p>
      <p style="font-size: 12px; color: #666;">错误信息: ${err.message}</p>
    </div>`;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  loadAllProjects();
});
