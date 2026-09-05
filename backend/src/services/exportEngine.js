const fs = require('fs-extra');
const path = require('path');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const pptxgen = require('pptxgenjs');
const { marked } = require('marked');

async function exportPDF(htmlContent, outputPath) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    throw new Error('puppeteer is not installed. Run: npm install puppeteer');
  }
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Georgia', serif; margin: 40px; line-height: 1.6; color: #333; }
        h1, h2, h3 { color: #1a1a2e; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
        blockquote { border-left: 4px solid #6c63ff; margin: 0; padding: 8px 16px; background: #f9f9ff; }
      </style>
    </head>
    <body>${htmlContent}</body>
    </html>`;
  await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: { top: '1in', right: '0.75in', bottom: '1in', left: '0.75in' },
    printBackground: true,
  });
  await browser.close();
}

async function exportHTML(htmlContent, outputDir) {
  await fs.ensureDir(outputDir);
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Content</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.7; color: #222; }
    img { max-width: 100%; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 6px; }
    blockquote { border-left: 4px solid #6c63ff; margin: 0; padding: 0.5rem 1rem; }
  </style>
</head>
<body>${htmlContent}</body>
</html>`;
  await fs.writeFile(path.join(outputDir, 'index.html'), fullHtml);
}

async function exportEPUB(content, metadata, outputPath) {
  const { generate: epubGen } = require('epub-gen');
  const options = {
    title: (metadata && metadata.title) || 'Untitled',
    author: (metadata && metadata.author) || 'AI Content Studio',
    content: [{ title: 'Chapter 1', data: content }],
  };
  await epubGen(options, outputPath);
}

async function exportDOCX(content, outputPath) {
  const paragraphs = content.split('\n').filter(Boolean).map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line, size: 24 })],
      })
  );
  const doc = new Document({
    sections: [{ children: paragraphs }],
  });
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(outputPath, buffer);
}

async function exportPPTX(content, outputPath) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  const slides = content.split('\n\n').filter(Boolean);
  slides.forEach((slideContent) => {
    const slide = pptx.addSlide();
    slide.addText(slideContent.trim(), {
      x: 0.8,
      y: 0.8,
      w: 8.4,
      h: 4.4,
      fontSize: 18,
      color: '333333',
    });
  });
  await pptx.writeFile({ fileName: outputPath });
}

async function exportContent(format, content, metadata, outputPath) {
  switch (format) {
    case 'pdf':
      return exportPDF(content, outputPath);
    case 'html': {
      const dir = outputPath.replace(/\.[^.]+$/, '');
      return exportHTML(content, dir);
    }
    case 'epub':
      return exportEPUB(content, metadata, outputPath);
    case 'docx':
      return exportDOCX(content, outputPath);
    case 'pptx':
      return exportPPTX(content, outputPath);
    case 'markdown':
    case 'md':
      return fs.writeFile(outputPath, content);
    case 'json':
      return fs.writeJson(outputPath, { content, metadata });
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

module.exports = { exportContent };
