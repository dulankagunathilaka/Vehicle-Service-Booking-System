const fs = require('fs');
const path = require('path');

const BASE = path.resolve('d:\\Documents\\Projects\\Vehicle-Service-Booking-System\\frontend');

const files = [
  'src/main.jsx',
  'src/App.jsx',
  'src/App.css',
  'src/components/AdminLayout.jsx',
  'src/components/Navbar.jsx',
  'src/context/AuthContext.jsx',
  'src/pages/AdminDashboard.jsx',
  'src/pages/Booking.jsx',
  'src/pages/CustomerDashboard.jsx',
  'src/pages/LearnMore.jsx',
  'src/pages/Payments.jsx',
  'src/pages/SignIn.jsx',
  'src/pages/SignUp.jsx',
  'src/pages/admin/AdminBilling.jsx',
  'src/pages/admin/AdminBookings.jsx',
  'src/pages/admin/AdminCustomers.jsx',
  'src/pages/admin/AdminInventory.jsx',
  'src/pages/admin/AdminNotifications.jsx',
  'src/pages/admin/AdminOverview.jsx',
  'src/pages/admin/AdminReviews.jsx',
  'src/pages/admin/AdminServices.jsx',
  'src/styles/index.css',
  'index.html',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
];

function stripJSComments(code) {
  let result = '';
  let i = 0;
  let commentCount = 0;
  const len = code.length;

  while (i < len) {
    const ch = code[i];
    const next = i + 1 < len ? code[i + 1] : '';

    // Single or double quoted strings - copy verbatim
    if (ch === '"' || ch === "'") {
      const quote = ch;
      result += ch; i++;
      while (i < len) {
        if (code[i] === '\\') {
          result += code[i]; i++;
          if (i < len) { result += code[i]; i++; }
        } else if (code[i] === quote) {
          result += code[i]; i++; break;
        } else if (code[i] === '\n') {
          result += code[i]; i++; break;
        } else {
          result += code[i]; i++;
        }
      }
    }
    // Template literals - copy verbatim (including ${} expressions)
    else if (ch === '`') {
      result += ch; i++;
      let depth = 0;
      while (i < len) {
        if (code[i] === '\\') {
          result += code[i]; i++;
          if (i < len) { result += code[i]; i++; }
        } else if (code[i] === '`' && depth === 0) {
          result += code[i]; i++; break;
        } else if (code[i] === '$' && i + 1 < len && code[i + 1] === '{') {
          result += '${'; i += 2; depth++;
        } else if (code[i] === '{' && depth > 0) {
          depth++; result += code[i]; i++;
        } else if (code[i] === '}' && depth > 0) {
          depth--; result += code[i]; i++;
        } else {
          result += code[i]; i++;
        }
      }
    }
    // Single-line comment
    else if (ch === '/' && next === '/') {
      commentCount++; i += 2;
      while (i < len && code[i] !== '\n') i++;
    }
    // Multi-line / block comment
    else if (ch === '/' && next === '*') {
      commentCount++; i += 2;
      while (i < len && !(code[i] === '*' && i + 1 < len && code[i + 1] === '/')) i++;
      if (i < len) i += 2;
    }
    // Everything else
    else {
      result += ch; i++;
    }
  }

  return { result, commentCount };
}

function stripCSSComments(code) {
  let result = '';
  let i = 0;
  let commentCount = 0;
  const len = code.length;

  while (i < len) {
    // Handle strings in CSS
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      result += code[i]; i++;
      while (i < len && code[i] !== quote) {
        if (code[i] === '\\') {
          result += code[i]; i++;
          if (i < len) { result += code[i]; i++; }
        } else {
          result += code[i]; i++;
        }
      }
      if (i < len) { result += code[i]; i++; }
    }
    // CSS block comment
    else if (code[i] === '/' && i + 1 < len && code[i + 1] === '*') {
      commentCount++; i += 2;
      while (i < len && !(code[i] === '*' && i + 1 < len && code[i + 1] === '/')) i++;
      if (i < len) i += 2;
    }
    else {
      result += code[i]; i++;
    }
  }

  return { result, commentCount };
}

function stripHTMLComments(code) {
  let commentCount = 0;
  const result = code.replace(/<!--[\s\S]*?-->/g, () => { commentCount++; return ''; });
  return { result, commentCount };
}

function cleanupLines(code) {
  let lines = code.split('\n');

  // Trim trailing whitespace (including \r from CRLF)
  lines = lines.map(line => line.replace(/\s+$/, ''));

  // Remove lines that are only leftover {} from JSX comment removal
  lines = lines.map(line => /^\s*\{\s*\}$/.test(line) ? '' : line);

  // Collapse consecutive blank lines to at most one
  const cleaned = [];
  let prevBlank = false;
  for (const line of lines) {
    const isBlank = line === '';
    if (isBlank && prevBlank) continue;
    cleaned.push(line);
    prevBlank = isBlank;
  }

  // Remove leading blank lines
  while (cleaned.length > 0 && cleaned[0] === '') cleaned.shift();
  // Remove trailing blank lines
  while (cleaned.length > 0 && cleaned[cleaned.length - 1] === '') cleaned.pop();

  return cleaned.join('\n') + '\n';
}

const report = [];

for (const relPath of files) {
  const fullPath = path.join(BASE, relPath);
  let content;
  try { content = fs.readFileSync(fullPath, 'utf8'); }
  catch { report.push(relPath + ': SKIPPED (not found)'); continue; }

  const ext = path.extname(relPath);
  let r;

  if (ext === '.html') r = stripHTMLComments(content);
  else if (ext === '.css') r = stripCSSComments(content);
  else r = stripJSComments(content);

  const processed = cleanupLines(r.result);

  fs.writeFileSync(fullPath, processed, 'utf8');
  report.push(relPath + ': ' + r.commentCount + ' comment(s) removed');
}

console.log('\n=== Comment Removal Report ===');
report.forEach(r => console.log(r));
console.log('\nDone!');
