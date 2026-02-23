const fs = require('fs');
const xml = fs.readFileSync('extracted_docx/word/document.xml', 'utf8');
const text = xml.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n');
fs.writeFileSync('extracted_text_clean.txt', text);
