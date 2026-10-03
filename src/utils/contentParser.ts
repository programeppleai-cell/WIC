export interface ParsedBlock {
  type: 
    | 'paragraph'
    | 'heading2'
    | 'heading3'
    | 'callout'
    | 'checklist'
    | 'table'
    | 'worksheet'
    | 'bullet'
    | 'numbered';
  calloutType?: 'tips' | 'catatan' | 'perhatian' | 'contoh' | 'langkah_aksi' | 'poin_kunci';
  title?: string;
  content: string;
  items?: string[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export function cleanDuplicateHeading(content: string, chapterTitle: string, chapterNumber: number): string {
  if (!content) return '';
  let cleaned = content.trim();

  // Strip leading lines like "Bab 1: ...", "BAB 1", or exact match with chapterTitle
  const lines = cleaned.split('\n');
  const firstLine = lines[0].trim();

  const isDuplicatePattern = 
    new RegExp(`^(Bab|BAB)\\s*${chapterNumber}[:\\s\\-–—]*`, 'i').test(firstLine) ||
    firstLine.toLowerCase() === chapterTitle.toLowerCase() ||
    firstLine.replace(/^#+\s*/, '').toLowerCase() === chapterTitle.toLowerCase();

  if (isDuplicatePattern) {
    lines.shift();
    // Also remove empty line if any
    while (lines.length > 0 && lines[0].trim() === '') {
      lines.shift();
    }
    cleaned = lines.join('\n');
  }

  return cleaned;
}

export function parseContentBlocks(rawContent: string): ParsedBlock[] {
  if (!rawContent) return [];
  const blocks: ParsedBlock[] = [];
  const lines = rawContent.split('\n');

  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join('\n').trim();
      if (text) {
        blocks.push({
          type: 'paragraph',
          content: text,
        });
      }
      currentParagraphLines = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Check for callouts like [TIPS] ... [/TIPS]
    const calloutMatch = trimmed.match(/^\[(TIPS|CATATAN|PERHATIAN|CONTOH|LANGKAH AKSI|POIN KUNCI BAB INI|POIN KUNCI)\]/i);
    if (calloutMatch) {
      flushParagraph();
      const rawTag = calloutMatch[1].toUpperCase();
      let calloutType: ParsedBlock['calloutType'] = 'tips';
      let title = 'TIPS';

      if (rawTag === 'CATATAN') {
        calloutType = 'catatan';
        title = 'CATATAN';
      } else if (rawTag === 'PERHATIAN') {
        calloutType = 'perhatian';
        title = 'PERHATIAN';
      } else if (rawTag === 'CONTOH') {
        calloutType = 'contoh';
        title = 'CONTOH ILUSTRATIF';
      } else if (rawTag === 'LANGKAH AKSI') {
        calloutType = 'langkah_aksi';
        title = 'LANGKAH AKSI';
      } else if (rawTag.includes('POIN KUNCI')) {
        calloutType = 'poin_kunci';
        title = 'POIN KUNCI BAB INI';
      }

      // Collect callout lines until matching closing tag or empty block
      const closeTag = `[/${calloutMatch[1]}]`.toLowerCase();
      const calloutLines: string[] = [];
      // If content is on the same line after [TAG]
      let remainder = trimmed.substring(calloutMatch[0].length).trim();
      if (remainder.toLowerCase().endsWith(closeTag)) {
        remainder = remainder.substring(0, remainder.length - closeTag.length).trim();
        calloutLines.push(remainder);
        i++;
      } else {
        if (remainder) calloutLines.push(remainder);
        i++;
        while (i < lines.length) {
          const l = lines[i];
          if (l.toLowerCase().includes(closeTag) || (l.trim().startsWith('[') && l.trim().endsWith(']') && l.trim().startsWith('[/'))) {
            const stripped = l.replace(new RegExp(`\\[\\/${calloutMatch[1]}\\]`, 'i'), '').trim();
            if (stripped) calloutLines.push(stripped);
            i++;
            break;
          }
          calloutLines.push(l);
          i++;
        }
      }

      blocks.push({
        type: 'callout',
        calloutType,
        title,
        content: calloutLines.join('\n').trim(),
      });
      continue;
    }

    // 2. Headings (## or ###)
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      blocks.push({
        type: 'heading3',
        content: trimmed.replace(/^###\s+/, '').trim(),
      });
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      blocks.push({
        type: 'heading2',
        content: trimmed.replace(/^##\s+/, '').trim(),
      });
      i++;
      continue;
    }

    // 3. Tables (| col1 | col2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      flushParagraph();
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      // Parse headers and rows
      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        
        // Check if second row is separator |---|---|
        let startIndex = 1;
        if (tableLines[1].replace(/[\s\-|:]/g, '') === '') {
          startIndex = 2;
        }

        const rows: string[][] = [];
        for (let r = startIndex; r < tableLines.length; r++) {
          const cells = tableLines[r]
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          rows.push(cells);
        }

        blocks.push({
          type: 'table',
          content: tableLines.join('\n'),
          tableData: {
            headers: headerCells,
            rows,
          },
        });
      }
      continue;
    }

    // 4. Checklists (□ or [ ] or - [ ])
    if (/^(□|\[\s*\]|\-\s*\[\s*\])\s+/.test(trimmed)) {
      flushParagraph();
      const checklistItems: string[] = [];
      while (i < lines.length && /^(□|\[\s*\]|\-\s*\[\s*\])\s+/.test(lines[i].trim())) {
        checklistItems.push(lines[i].trim().replace(/^(□|\[\s*\]|\-\s*\[\s*\])\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'checklist',
        content: checklistItems.join('\n'),
        items: checklistItems,
      });
      continue;
    }

    // 5. Worksheets with answer lines (_____)
    if (trimmed.includes('_____') || trimmed.includes('.....') || (trimmed.startsWith('Jawaban:') && i + 1 < lines.length && lines[i + 1].includes('___'))) {
      flushParagraph();
      blocks.push({
        type: 'worksheet',
        content: trimmed,
      });
      i++;
      continue;
    }

    // 6. Bullet lists (- or * )
    if (/^[\-\*•]\s+/.test(trimmed)) {
      flushParagraph();
      const bulletItems: string[] = [];
      while (i < lines.length && /^[\-\*•]\s+/.test(lines[i].trim())) {
        bulletItems.push(lines[i].trim().replace(/^[\-\*•]\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'bullet',
        content: bulletItems.join('\n'),
        items: bulletItems,
      });
      continue;
    }

    // 7. Regular paragraph text
    if (trimmed === '') {
      flushParagraph();
    } else {
      currentParagraphLines.push(line);
    }
    i++;
  }

  flushParagraph();
  return blocks;
}
