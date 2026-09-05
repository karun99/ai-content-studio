const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'text/html': 'html',
  'text/markdown': 'markdown',
  'text/plain': 'text',
  'application/json': 'json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/epub+zip': 'epub',
};

async function parseFile(filePath, mimeType) {
  const ext = SUPPORTED_TYPES[mimeType] || path.extname(filePath).slice(1);
  const content = await fs.readFile(filePath, 'utf-8');

  switch (ext) {
    case 'markdown':
    case 'md':
      return {
        format: 'markdown',
        html: await marked(content),
        text: content,
      };
    case 'html':
      return {
        format: 'html',
        html: content,
        text: stripHtml(content),
      };
    case 'text':
      return {
        format: 'text',
        html: `<pre>${escapeHtml(content)}</pre>`,
        text: content,
      };
    case 'json': {
      const parsed = JSON.parse(content);
      return {
        format: 'json',
        html: `<pre>${escapeHtml(JSON.stringify(parsed, null, 2))}</pre>`,
        text: JSON.stringify(parsed, null, 2),
        data: parsed,
      };
    }
    case 'pdf':
      return await parsePdf(filePath);
    case 'docx':
      return await parseDocx(filePath);
    case 'pptx':
      return await parsePptx(filePath);
    case 'epub':
      return await parseEpub(filePath);
    default:
      return {
        format: ext,
        html: `<pre>${escapeHtml(content)}</pre>`,
        text: content,
      };
  }
}

async function parsePdf(filePath) {
  try {
    const { default: pdf } = await import('pdf-parse');
    const buffer = await fs.readFile(filePath);
    const data = await pdf(buffer);
    return {
      format: 'pdf',
      html: `<pre>${escapeHtml(data.text)}</pre>`,
      text: data.text,
      pages: data.numpages,
    };
  } catch {
    return { format: 'pdf', html: '<p>PDF parsing requires pdf-parse</p>', text: '' };
  }
}

async function parseDocx(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return {
      format: 'docx',
      html: `<p>${escapeHtml(result.value)}</p>`,
      text: result.value,
    };
  } catch {
    return { format: 'docx', html: '<p>DOCX parsing requires mammoth</p>', text: '' };
  }
}

async function parsePptx(filePath) {
  try {
    const pptxParser = require('pptx-parser');
    const content = await fs.readFile(filePath);
    const slides = await pptxParser(content);
    const text = slides.map((s) => s.text || '').join('\n\n');
    return {
      format: 'pptx',
      html: `<p>${escapeHtml(text)}</p>`,
      text,
      slides: slides.length,
    };
  } catch {
    return { format: 'pptx', html: '<p>PPTX parsing requires pptx-parser</p>', text: '' };
  }
}

async function parseEpub(filePath) {
  try {
    const epub = require('epub2');
    const book = await epub.parse(filePath);
    const chapters = [];
    for (const item of book.flow) {
      const chapter = await new Promise((resolve) => {
        book.getChapter(item.id, (err, text) => {
          resolve(err ? '' : text);
        });
      });
      chapters.push(chapter);
    }
    const text = chapters.join('\n\n');
    return {
      format: 'epub',
      html: text,
      text: stripHtml(text),
      chapters: chapters.length,
    };
  } catch {
    return { format: 'epub', html: '<p>EPUB parsing requires epub2</p>', text: '' };
  }
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = { parseFile };
