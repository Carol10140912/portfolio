function stripFrontMatter(md) {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3);
    if (end !== -1) {
      return md.slice(end + 4).replace(/^\s+/, '');
    }
  }
  return md;
}

function renderMarkdownFrom(path, containerId) {
  fetch(path, { cache: 'no-store' })
    .then(function (res) { return res.text(); })
    .then(function (text) {
      var content = stripFrontMatter(text);
      var html = marked.parse(content);
      var el = document.getElementById(containerId);
      if (el) el.innerHTML = html;
    })
    .catch(function (err) {
      var el = document.getElementById(containerId);
      if (el) el.textContent = '内容加载失败，请稍后重试。';
      console.error(err);
    });
}

document.addEventListener('DOMContentLoaded', function () {
  renderMarkdownFrom('projects/myfit.md', 'content');
});
