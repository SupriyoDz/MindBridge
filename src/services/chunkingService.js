// Chunking & Text Processing Service
// Chunks long documents by headings or ~1500-word blocks and summarizes them if necessary

export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function chunkDocumentByHeadings(text, maxWordsPerChunk = 1500) {
  if (!text) return [];

  // Split by markdown headings (#, ##, ###) or major capitalized section headings
  const lines = text.split('\n');
  const chunks = [];
  let currentChunkLines = [];
  let currentWordCount = 0;

  const isHeading = (line) => {
    const trimmed = line.trim();
    return /^#{1,4}\s+/.test(trimmed) || 
           /^(Chapter|Section|Module|Unit|Week|Lecture)\s+\d+[:.]?/i.test(trimmed);
  };

  for (const line of lines) {
    const lineWordCount = countWords(line);

    // If we hit a heading and the current chunk already has substantial words
    if (isHeading(line) && currentWordCount > 500) {
      chunks.push(currentChunkLines.join('\n').trim());
      currentChunkLines = [line];
      currentWordCount = lineWordCount;
      continue;
    }

    // If chunk exceeds maxWordsPerChunk, split
    if (currentWordCount + lineWordCount > maxWordsPerChunk && currentChunkLines.length > 0) {
      chunks.push(currentChunkLines.join('\n').trim());
      currentChunkLines = [line];
      currentWordCount = lineWordCount;
      continue;
    }

    currentChunkLines.push(line);
    currentWordCount += lineWordCount;
  }

  if (currentChunkLines.length > 0 && currentChunkLines.join('').trim().length > 0) {
    chunks.push(currentChunkLines.join('\n').trim());
  }

  return chunks.length > 0 ? chunks : [text];
}
