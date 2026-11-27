/**
 * MindBridge Submission Documentation Generator
 * Compiles Markdown specifications into matching .docx and .pdf documents
 * using native docx and pdfkit libraries.
 */

const fs = require('fs');
const path = require('path');
const docx = require('docx');
const PDFDocument = require('pdfkit');

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} = docx;

// Color Palette Constants
const COLORS = {
  primary: '#0369a1',     // Sky-700
  primaryHex: '0369A1',
  dark: '#0f172a',        // Slate-900
  darkHex: '0F172A',
  body: '#1e293b',        // Slate-800
  bodyHex: '1E293B',
  muted: '#64748b',       // Slate-500
  mutedHex: '64748B',
  subtle: '#94a3b8',      // Slate-400
  subtleHex: '94A3B8',
  border: '#cbd5e1',      // Slate-300
  borderHex: 'CBD5E1',
  lightBg: '#f8fafc',     // Slate-50
  lightBgHex: 'F8FAFC',
  tableHeaderBg: '#f1f5f9',
  tableHeaderBgHex: 'F1F5F9'
};

/**
 * Parse Markdown content into structured AST-like blocks
 */
function parseMarkdown(mdText) {
  const lines = mdText.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal Rule
    if (/^---+\s*$/.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Code Block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: 'code', lang, text: codeLines.join('\n') });
      continue;
    }

    // Table
    if (line.trim().startsWith('|') && line.includes('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        // Skip separator line (| --- | --- |)
        if (!/^[|\s-:]+$/.test(lines[i].trim())) {
          const cells = lines[i]
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          tableLines.push(cells);
        }
        i++;
      }
      if (tableLines.length > 0) {
        blocks.push({
          type: 'table',
          header: tableLines[0],
          rows: tableLines.slice(1)
        });
      }
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: line.slice(5).trim() });
      i++;
      continue;
    }

    // Lists
    if (/^[-*]\s+/.test(line)) {
      blocks.push({ type: 'bullet', text: line.replace(/^[-*]\s+/, '').trim() });
      i++;
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      blocks.push({
        type: 'number',
        prefix: line.match(/^\d+\./)[0],
        text: line.replace(/^\d+\.\s+/, '').trim()
      });
      i++;
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Standard Paragraph
    let paraText = line;
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('|') &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^---+\s*$/.test(lines[i])
    ) {
      paraText += ' ' + lines[i].trim();
      i++;
    }
    blocks.push({ type: 'p', text: paraText.trim() });
  }

  return blocks;
}

/**
 * Helper to strip markdown symbols for clean plain text
 */
function cleanInlineMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\sum/g, '∑')
    .replace(/\\in/g, '∈')
    .replace(/\\times/g, '×')
    .replace(/\\to/g, '→')
    .replace(/\$+/g, '');
}

/**
 * Break inline text into formatted TextRuns for docx
 */
function createFormattedTextRuns(text, baseColor = COLORS.bodyHex, baseSize = 18) {
  // Simple tokenization of **bold** and `code`
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);
  const runs = [];

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(
        new TextRun({
          text: cleanInlineMarkdown(part.slice(2, -2)),
          bold: true,
          color: baseColor,
          size: baseSize
        })
      );
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(
        new TextRun({
          text: part.slice(1, -1),
          font: 'Courier New',
          color: COLORS.darkHex,
          size: baseSize - 2,
          shading: {
            type: ShadingType.CLEAR,
            fill: 'F1F5F9'
          }
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: cleanInlineMarkdown(part),
          color: baseColor,
          size: baseSize
        })
      );
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text: cleanInlineMarkdown(text), size: baseSize })];
}

/**
 * Generate Microsoft Word (.docx) Document
 */
async function generateDocx(blocks, outputPath, title = 'MindBridge Specification') {
  const docxChildren = [];

  for (const block of blocks) {
    if (block.type === 'h1') {
      docxChildren.push(
        new Paragraph({
          text: cleanInlineMarkdown(block.text),
          heading: HeadingLevel.TITLE,
          spacing: { before: 300, after: 120 }
        })
      );
    } else if (block.type === 'h2') {
      docxChildren.push(
        new Paragraph({
          text: cleanInlineMarkdown(block.text),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 260, after: 100 }
        })
      );
    } else if (block.type === 'h3') {
      docxChildren.push(
        new Paragraph({
          text: cleanInlineMarkdown(block.text),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 80 }
        })
      );
    } else if (block.type === 'h4') {
      docxChildren.push(
        new Paragraph({
          text: cleanInlineMarkdown(block.text),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 60 }
        })
      );
    } else if (block.type === 'hr') {
      docxChildren.push(
        new Paragraph({
          spacing: { before: 140, after: 140 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.borderHex, space: 1 }
          }
        })
      );
    } else if (block.type === 'code') {
      // Split into lines for code block formatting
      const lines = block.text.split('\n');
      for (const cl of lines) {
        docxChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cl,
                font: 'Courier New',
                size: 15,
                color: COLORS.darkHex
              })
            ],
            shading: {
              type: ShadingType.CLEAR,
              fill: 'F8FAFC'
            },
            spacing: { before: 10, after: 10 }
          })
        );
      }
    } else if (block.type === 'table') {
      const rows = [];

      // Header Row
      rows.push(
        new TableRow({
          tableHeader: true,
          children: block.header.map(
            (h) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cleanInlineMarkdown(h),
                        bold: true,
                        size: 16,
                        color: COLORS.darkHex
                      })
                    ]
                  })
                ],
                shading: {
                  type: ShadingType.CLEAR,
                  fill: COLORS.tableHeaderBgHex
                }
              })
          )
        })
      );

      // Data Rows
      for (const row of block.rows) {
        rows.push(
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: createFormattedTextRuns(cell, COLORS.bodyHex, 16)
                    })
                  ]
                })
            )
          })
        );
      }

      docxChildren.push(
        new Table({
          rows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          }
        })
      );
      docxChildren.push(new Paragraph({ spacing: { after: 120 } }));
    } else if (block.type === 'bullet') {
      docxChildren.push(
        new Paragraph({
          children: createFormattedTextRuns(block.text, COLORS.bodyHex, 18),
          bullet: { level: 0 },
          spacing: { before: 40, after: 40 }
        })
      );
    } else if (block.type === 'number') {
      docxChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: block.prefix + ' ', bold: true, size: 18, color: COLORS.primaryHex }),
            ...createFormattedTextRuns(block.text, COLORS.bodyHex, 18)
          ],
          spacing: { before: 40, after: 40 }
        })
      );
    } else if (block.type === 'p') {
      docxChildren.push(
        new Paragraph({
          children: createFormattedTextRuns(block.text, COLORS.bodyHex, 18),
          spacing: { before: 60, after: 60 }
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720
            }
          }
        },
        children: docxChildren
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

/**
 * Generate PDF Document matching repository styling
 */
function generatePdf(blocks, outputPath, title = 'MindBridge Specification') {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 45, right: 45 },
      bufferPages: true,
      info: {
        Title: title,
        Author: 'MindBridge Academic AI Studio',
        Creator: 'PDFKit',
        Producer: 'PDFKit'
      }
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 45;
    const contentWidth = pageWidth - margin * 2; // ~505.28 pt

    const checkPageBreak = (neededHeight) => {
      if (doc.y + neededHeight > pageHeight - 55) {
        doc.addPage();
      }
    };

    for (const block of blocks) {
      if (block.type === 'h1') {
        checkPageBreak(35);
        doc
          .font('Helvetica-Bold')
          .fontSize(18)
          .fillColor(COLORS.dark)
          .text(cleanInlineMarkdown(block.text), { width: contentWidth })
          .moveDown(0.2);
      } else if (block.type === 'h2') {
        checkPageBreak(28);
        doc
          .font('Helvetica-Bold')
          .fontSize(13)
          .fillColor(COLORS.primary)
          .text(cleanInlineMarkdown(block.text), { width: contentWidth })
          .moveDown(0.25);
      } else if (block.type === 'h3') {
        checkPageBreak(24);
        doc
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .fillColor(COLORS.dark)
          .text(cleanInlineMarkdown(block.text), { width: contentWidth })
          .moveDown(0.2);
      } else if (block.type === 'h4') {
        checkPageBreak(20);
        doc
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .fillColor(COLORS.body)
          .text(cleanInlineMarkdown(block.text), { width: contentWidth })
          .moveDown(0.15);
      } else if (block.type === 'hr') {
        checkPageBreak(12);
        doc.moveDown(0.2);
        const y = doc.y;
        doc
          .strokeColor(COLORS.border)
          .lineWidth(0.5)
          .moveTo(margin, y)
          .lineTo(pageWidth - margin, y)
          .stroke();
        doc.moveDown(0.3);
      } else if (block.type === 'code') {
        const lines = block.text.split('\n');
        const codeText = lines.slice(0, 40).join('\n'); // guard length per snippet
        doc.font('Courier').fontSize(7.5);
        const blockHeight = doc.heightOfString(codeText, { width: contentWidth - 16 }) + 14;

        checkPageBreak(Math.min(blockHeight, 200));

        const startY = doc.y;
        doc
          .rect(margin, startY, contentWidth, blockHeight)
          .fillAndStroke(COLORS.lightBg, COLORS.border);

        doc
          .fillColor(COLORS.dark)
          .text(codeText, margin + 8, startY + 7, {
            width: contentWidth - 16,
            lineGap: 1
          });

        doc.y = startY + blockHeight + 6;
      } else if (block.type === 'table') {
        checkPageBreak(40);
        const colCount = block.header.length;
        const colWidth = contentWidth / colCount;

        // Render header
        const headerY = doc.y;
        doc
          .rect(margin, headerY, contentWidth, 18)
          .fillAndStroke(COLORS.tableHeaderBg, COLORS.border);

        doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.dark);
        block.header.forEach((h, idx) => {
          doc.text(cleanInlineMarkdown(h), margin + idx * colWidth + 4, headerY + 5, {
            width: colWidth - 8,
            ellipsis: true
          });
        });

        doc.y = headerY + 18;

        // Render rows
        doc.font('Helvetica').fontSize(8).fillColor(COLORS.body);
        for (const row of block.rows) {
          checkPageBreak(18);
          const rowY = doc.y;
          doc
            .rect(margin, rowY, contentWidth, 16)
            .strokeColor(COLORS.border)
            .lineWidth(0.5)
            .stroke();

          row.forEach((cell, idx) => {
            doc.text(cleanInlineMarkdown(cell), margin + idx * colWidth + 4, rowY + 4, {
              width: colWidth - 8,
              ellipsis: true
            });
          });
          doc.y = rowY + 16;
        }
        doc.moveDown(0.3);
      } else if (block.type === 'bullet') {
        checkPageBreak(14);
        const bulletY = doc.y;
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(COLORS.primary)
          .text('•', margin + 4, bulletY);

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(COLORS.body)
          .text(cleanInlineMarkdown(block.text), margin + 14, bulletY, {
            width: contentWidth - 14,
            lineGap: 2.5
          });
        doc.moveDown(0.15);
      } else if (block.type === 'number') {
        checkPageBreak(14);
        const numY = doc.y;
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(COLORS.primary)
          .text(block.prefix, margin, numY);

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(COLORS.body)
          .text(cleanInlineMarkdown(block.text), margin + 18, numY, {
            width: contentWidth - 18,
            lineGap: 2.5
          });
        doc.moveDown(0.15);
      } else if (block.type === 'p') {
        checkPageBreak(16);
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(COLORS.body)
          .text(cleanInlineMarkdown(block.text), margin, doc.y, {
            width: contentWidth,
            lineGap: 2.5
          })
          .moveDown(0.25);
      }
    }

    // Post-pass: Running Headers & Footers on every page
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);

      // Suppress bottom margin checks during header and footer drawing so PDFKit does not trigger spurious addPage()
      const prevBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      // Running Header
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(COLORS.subtle)
        .text(
          'MindBridge ACADEMIC AI STUDIO | ACADEMIC SPECIFICATION',
          margin,
          24,
          { width: contentWidth, align: 'right', lineBreak: false }
        );

      doc
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .moveTo(margin, 35)
        .lineTo(pageWidth - margin, 35)
        .stroke();

      // Running Footer Divider
      doc
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .moveTo(margin, 798)
        .lineTo(pageWidth - margin, 798)
        .stroke();

      // Running Footer
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(COLORS.subtle)
        .text('MindBridge: Teaching-Content-to-Review-Ready Artifact Studio', margin, 808, {
          width: contentWidth * 0.7,
          align: 'left',
          lineBreak: false
        });

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(COLORS.subtle)
        .text(`Page ${i + 1} of ${range.count}`, margin, 808, {
          width: contentWidth,
          align: 'right',
          lineBreak: false
        });

      // Restore bottom margin
      doc.page.margins.bottom = prevBottomMargin;
    }

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

/**
 * Main execution routine
 */
async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const docsDir = path.join(rootDir, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  console.log('Generating MindBridge Submission Documents in docs/...');

  const docsToGenerate = [
    {
      sourceMd: 'SUMMARY.md',
      targetDocx: 'SUMMARY.docx',
      targetPdf: 'SUMMARY.pdf',
      title: 'MindBridge: Executive Summary'
    },
    {
      sourceMd: 'SOLUTION_DESCRIPTION.md',
      targetDocx: 'SOLUTION_DESCRIPTION.docx',
      targetPdf: 'SOLUTION_DESCRIPTION.pdf',
      title: 'MindBridge: Solution Description & System Architecture'
    },
    {
      sourceMd: 'ARCHITECTURE.md',
      targetDocx: 'ARCHITECTURE.docx',
      targetPdf: 'ARCHITECTURE.pdf',
      title: 'MindBridge: System Architecture'
    },
    {
      sourceMd: 'PLAN.md',
      targetDocx: 'PLAN.docx',
      targetPdf: 'PLAN.pdf',
      title: 'MindBridge: Implementation Plan'
    }
  ];

  const combinedSections = [];

  for (const item of docsToGenerate) {
    const mdPath = path.join(docsDir, item.sourceMd);
    const docxPath = path.join(docsDir, item.targetDocx);
    const pdfPath = path.join(docsDir, item.targetPdf);

    if (!fs.existsSync(mdPath)) {
      console.warn(`Source markdown file not found: docs/${item.sourceMd}, skipping.`);
      continue;
    }

    console.log(`\nProcessing docs/${item.sourceMd}...`);
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    combinedSections.push(mdContent);
    const blocks = parseMarkdown(mdContent);
    console.log(`  Parsed ${blocks.length} structural blocks.`);

    // Generate DOCX
    console.log(`  Writing docs/${item.targetDocx}...`);
    await generateDocx(blocks, docxPath, item.title);
    const docxStat = fs.statSync(docxPath);
    console.log(`  ✓ Created docs/${item.targetDocx} (${(docxStat.size / 1024).toFixed(1)} KB)`);

    // Generate PDF
    console.log(`  Writing docs/${item.targetPdf}...`);
    await generatePdf(blocks, pdfPath, item.title);
    const pdfStat = fs.statSync(pdfPath);
    console.log(`  ✓ Created docs/${item.targetPdf} (${(pdfStat.size / 1024).toFixed(1)} KB)`);
  }

  // Generate Unified Complete Documentation Dossier
  if (combinedSections.length > 0) {
    console.log('\nProcessing unified MindBridge_Complete_Documentation...');
    const combinedMd = combinedSections.join('\n\n---\n\n');
    const combinedBlocks = parseMarkdown(combinedMd);
    const completeDocxPath = path.join(docsDir, 'MindBridge_Complete_Documentation.docx');
    const completePdfPath = path.join(docsDir, 'MindBridge_Complete_Documentation.pdf');
    const completeTitle = 'MindBridge: Complete Technical & Submission Documentation';

    await generateDocx(combinedBlocks, completeDocxPath, completeTitle);
    const cDocxStat = fs.statSync(completeDocxPath);
    console.log(`  ✓ Created docs/MindBridge_Complete_Documentation.docx (${(cDocxStat.size / 1024).toFixed(1)} KB)`);

    await generatePdf(combinedBlocks, completePdfPath, completeTitle);
    const cPdfStat = fs.statSync(completePdfPath);
    console.log(`  ✓ Created docs/MindBridge_Complete_Documentation.pdf (${(cPdfStat.size / 1024).toFixed(1)} KB)`);
  }

  console.log('\nAll documentation files compiled successfully in docs/!');
}

main().catch((err) => {
  console.error('Fatal error during documentation generation:', err);
  process.exit(1);
});
