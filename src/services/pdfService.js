import * as pdfjsLib from 'pdfjs-dist';

// Configure worker src with version matching or unpkg cdn fallback
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

/**
 * Extracts clean text from an uploaded PDF file.
 * Throws explicit error if the document is empty or scanned (no text layer).
 */
export async function extractTextFromPDF(fileOrArrayBuffer) {
  try {
    let arrayBuffer;
    if (fileOrArrayBuffer instanceof ArrayBuffer) {
      arrayBuffer = fileOrArrayBuffer;
    } else if (fileOrArrayBuffer instanceof Blob) {
      arrayBuffer = await fileOrArrayBuffer.arrayBuffer();
    } else {
      throw new Error("Invalid file format passed to extractTextFromPDF.");
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;

    if (numPages === 0) {
      throw new Error("Scanned or empty PDF detected: Document contains 0 pages.");
    }

    const pagesText = [];
    let totalChars = 0;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageStrings = textContent.items
        .map(item => ('str' in item ? item.str : ''))
        .filter(Boolean);

      const pageText = pageStrings.join(' ').trim();
      if (pageText.length > 0) {
        pagesText.push(`--- Page ${pageNum} ---\n${pageText}`);
        totalChars += pageText.length;
      }
    }

    const combinedText = pagesText.join('\n\n');

    // Strict validation: check for scanned or blank PDFs
    if (totalChars < 20 || combinedText.trim().length === 0) {
      throw new Error(
        "Scanned or empty PDF detected: No machine-readable text found in the document. Please upload a searchable digital PDF, text, or markdown file."
      );
    }

    return combinedText;
  } catch (error) {
    if (error.message && error.message.includes("Scanned or empty PDF detected")) {
      throw error;
    }
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Corrupt or unreadable file'}`);
  }
}
