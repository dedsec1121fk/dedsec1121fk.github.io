/* Small offline Markdown reader. Input stays data; no raw HTML is executed. */
(function (root) {
  "use strict";
  function escape(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return {"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[c];
    });
  }
  function inline(text, resolve) {
    // Tokenize before escaping so attributes never contain substituted HTML.
    var pattern = /`([^`\n]+)`|\[([^\]\n]+)\]\(([^\s)]+)\)|\*\*([^*\n]+)\*\*/g;
    var out = "", offset = 0, m;
    while ((m = pattern.exec(text))) {
      out += escape(text.slice(offset, m.index));
      if (m[1] !== undefined) out += "<code>" + escape(m[1]) + "</code>";
      else if (m[2] !== undefined) {
        var ref = m[3], href = null;
        if (/^https?:\/\//i.test(ref)) href = ref;
        else if (!/^[a-z][a-z\d+.-]*:|^\/\//i.test(ref)) href = resolve ? resolve(ref) : (/^#/.test(ref) ? ref : null);
        out += href ? '<a href="' + escape(href) + '"' + (/^https?:/i.test(href) ? ' rel="noopener noreferrer" target="_blank"' : '') + '>' + escape(m[2]) + '</a>' : escape(m[2]);
      } else out += "<strong>" + escape(m[4]) + "</strong>";
      offset = pattern.lastIndex;
    }
    return out + escape(text.slice(offset));
  }
  function render(markdown, resolve) {
    var lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    var out = [], code = [], fence = null, list = null;
    function closeList() { if (list) { out.push('</' + list + '>'); list = null; } }
    function emitCode() { out.push('<pre><code>' + escape(code.join('\n')) + '</code></pre>'); code = []; }
    function cells(line) { return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function(c) { return c.trim(); }); }
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i], m = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (fence) {
        if (m && m[1][0] === fence[0] && m[1].length >= fence.length && !m[2].trim()) { emitCode(); fence = null; }
        else code.push(line);
        continue;
      }
      if (m && !(m[1][0] === '`' && m[2].includes('`'))) { closeList(); fence = m[1]; continue; }
      if (/^(?: {4}|\t)/.test(line)) {
        closeList(); var indented=[];
        while(i<lines.length){
          if(/^(?: {4}|\t)/.test(lines[i]))indented.push(lines[i].replace(/^(?: {4}|\t)/,''));
          else if(!lines[i].trim() && i+1<lines.length && /^(?: {4}|\t)/.test(lines[i+1]))indented.push('');
          else break;
          i++;
        }
        i--;out.push('<pre><code>'+escape(indented.join('\n'))+'</code></pre>');continue;
      }
      if (!line.trim()) { closeList(); continue; }
      if (i + 1 < lines.length && line.includes('|') && /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i+1])) {
        closeList(); out.push('<div class="lesson-table"><table><thead><tr>' + cells(line).map(function(c) { return '<th>' + inline(c, resolve) + '</th>'; }).join('') + '</tr></thead><tbody>');
        i++;
        while (i+1 < lines.length && lines[i+1].trim() && lines[i+1].includes('|')) {
          i++; out.push('<tr>' + cells(lines[i]).map(function(c) { return '<td>' + inline(c, resolve) + '</td>'; }).join('') + '</tr>');
        }
        out.push('</tbody></table></div>'); continue;
      }
      if ((m = line.match(/^ {0,3}(#{1,6})\s+(.+)/))) { closeList(); var n = Math.min(6, m[1].length + 1); out.push('<h' + n + '>' + inline(m[2], resolve) + '</h' + n + '>'); continue; }
      if (/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(line)) { closeList(); out.push('<hr>'); continue; }
      if ((m = line.match(/^\s*([-*+]|\d+[.)])\s+(.+)/))) {
        var kind = /^\d/.test(m[1]) ? 'ol' : 'ul';
        if (list !== kind) { closeList(); list = kind; out.push('<' + kind + '>'); }
        out.push('<li>' + inline(m[2], resolve) + '</li>'); continue;
      }
      closeList();
      if ((m = line.match(/^\s*>\s?(.*)/))) out.push('<blockquote>' + inline(m[1], resolve) + '</blockquote>');
      else out.push('<p>' + inline(line, resolve) + '</p>');
    }
    closeList(); if (fence) emitCode();
    return out.join('\n');
  }
  root.DedSecMarkdown = {render: render};
})(typeof window !== 'undefined' ? window : globalThis);
