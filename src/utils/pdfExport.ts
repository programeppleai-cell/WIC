import { jsPDF } from 'jspdf';
import { Project } from '../types';
import { cleanDuplicateHeading, parseContentBlocks } from './contentParser';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function exportToPdf(project: Project): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2; // 170 mm
  let currentY = margin;

  const authorName = project.author || 'Penulis';
  const brandName = project.brand || 'Worth It Circle';
  const isWorkbook = project.productType === 'workbook';

  // Helper to check page overflow and create new page
  const checkNewPage = (requiredSpace: number) => {
    if (currentY + requiredSpace > pageHeight - margin - 15) {
      doc.addPage();
      currentY = margin + 5;
      return true;
    }
    return false;
  };

  // 1. COVER PAGE
  if (project.coverImage) {
    try {
      doc.addImage(project.coverImage, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      doc.addPage();
      currentY = margin;
    } catch (e) {
      console.warn('Cover image render failed in PDF, proceeding to title page', e);
    }
  }

  // 2. TITLE PAGE
  currentY = 60;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 120, 85); // emerald
  doc.text(isWorkbook ? 'WORKBOOK & ACTION PLAN' : 'PANDUAN PRAKTIS DIGITAL', pageWidth / 2, currentY, { align: 'center' });

  currentY += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(17, 24, 39);
  const titleLines = doc.splitTextToSize(project.title, contentWidth);
  doc.text(titleLines, pageWidth / 2, currentY, { align: 'center' });
  currentY += titleLines.length * 10;

  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99);
  const descLines = doc.splitTextToSize(project.description, contentWidth - 20);
  doc.text(descLines, pageWidth / 2, currentY, { align: 'center' });
  currentY += descLines.length * 6;

  // Bottom of title page: Author & Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(31, 41, 55);
  doc.text(authorName, pageWidth / 2, 225, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(5, 150, 105);
  doc.text(brandName, pageWidth / 2, 233, { align: 'center' });

  // 3. COPYRIGHT PAGE
  doc.addPage();
  currentY = margin + 25;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text('HAK CIPTA & KETENTUAN', margin, currentY);
  currentY += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);
  const year = new Date().getFullYear();
  doc.text(`Hak Cipta © ${year} oleh ${authorName}.`, margin, currentY);
  currentY += 7;

  const copyrightNotice = `Diterbitkan secara digital oleh ${brandName}. Seluruh hak cipta dilindungi undang-undang. Tidak ada bagian dari dokumen digital ini yang boleh digandakan, disebarluaskan, atau dialihkan dalam bentuk apa pun tanpa izin tertulis dari pemegang hak cipta, kecuali kutipan singkat untuk keperluan ulasan.`;
  const noticeLines = doc.splitTextToSize(copyrightNotice, contentWidth);
  doc.text(noticeLines, margin, currentY);
  currentY += noticeLines.length * 5 + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text('DISCLAIMER (SANGGAHAN)', margin, currentY);
  currentY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(75, 85, 99);
  const disclaimerText = `Buku/Lembar kerja ini disusun untuk tujuan panduan dan edukasi praktis. Hasil yang diperoleh setiap pembaca dapat berbeda tergantung pada tindakan nyata, keahlian, dan kondisi pasar masing-masing. Penulis maupun penerbit tidak menjamin pendapatan atau hasil komersial tertentu. Contoh-contoh yang terdapat di dalam buku ini merupakan ilustrasi praktis untuk mempermudah implementasi.`;
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(disclaimerLines, margin, currentY);

  // 4. DAFTAR ISI (STATIC TOC)
  doc.addPage();
  currentY = margin + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(6, 95, 70); // dark emerald
  doc.text('DAFTAR ISI', margin, currentY);
  currentY += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(31, 41, 55);

  doc.text('• Pendahuluan', margin, currentY);
  currentY += 8;

  project.outline.forEach((ch) => {
    checkNewPage(10);
    doc.text(`• Bab ${ch.number}: ${ch.title}`, margin, currentY);
    currentY += 7.5;
  });

  checkNewPage(10);
  doc.text('• Penutup & Rencana Aksi', margin, currentY);

  // 5. PENDAHULUAN
  if (project.introduction) {
    doc.addPage();
    currentY = margin + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(6, 95, 70);
    doc.text('PENDAHULUAN', margin, currentY);
    currentY += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);

    const introParagraphs = project.introduction.split('\n\n');
    introParagraphs.forEach((para) => {
      const pLines = doc.splitTextToSize(para.trim(), contentWidth);
      checkNewPage(pLines.length * 5.5 + 6);
      doc.text(pLines, margin, currentY);
      currentY += pLines.length * 5.5 + 5;
    });
  }

  // 6. CHAPTERS
  project.chapters.forEach((chapter) => {
    // Chapter Divider Page
    doc.addPage();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(5, 150, 105);
    doc.text(`BAB ${chapter.number.toString().padStart(2, '0')}`, pageWidth / 2, 110, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39);
    const chTitleLines = doc.splitTextToSize(chapter.title, contentWidth - 20);
    doc.text(chTitleLines, pageWidth / 2, 125, { align: 'center' });

    // Chapter Content Page
    doc.addPage();
    currentY = margin + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(6, 95, 70);
    doc.text(`Bab ${chapter.number}: ${chapter.title}`, margin, currentY);
    currentY += 12;

    const cleaned = cleanDuplicateHeading(chapter.content, chapter.title, chapter.number);
    const blocks = parseContentBlocks(cleaned);

    blocks.forEach((block) => {
      if (block.type === 'heading2') {
        checkNewPage(16);
        currentY += 3;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(31, 41, 55);
        doc.text(block.content, margin, currentY);
        currentY += 8;
      } else if (block.type === 'heading3') {
        checkNewPage(14);
        currentY += 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(55, 65, 81);
        doc.text(block.content, margin, currentY);
        currentY += 7;
      } else if (block.type === 'callout') {
        // Render callout card
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        const calloutLines = doc.splitTextToSize(block.content, contentWidth - 12);
        const boxHeight = 10 + calloutLines.length * 5 + 6;

        checkNewPage(boxHeight + 4);

        // Background box
        doc.setFillColor(240, 253, 244); // light green bg
        doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'F');

        // Left accent bar
        const barColor: [number, number, number] =
          block.calloutType === 'perhatian'
            ? [217, 119, 6]
            : block.calloutType === 'contoh'
            ? [79, 70, 229]
            : [5, 150, 105];

        doc.setFillColor(barColor[0], barColor[1], barColor[2]);
        doc.rect(margin, currentY, 3, boxHeight, 'F');

        // Callout Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(barColor[0], barColor[1], barColor[2]);
        doc.text(`[ ${block.title} ]`, margin + 6, currentY + 6);

        // Callout text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);
        doc.text(calloutLines, margin + 6, currentY + 12);

        currentY += boxHeight + 5;
      } else if (block.type === 'checklist' && block.items) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(31, 41, 55);

        block.items.forEach((it) => {
          const itemLines = doc.splitTextToSize(it, contentWidth - 10);
          checkNewPage(itemLines.length * 5 + 4);

          // Draw checkbox square
          doc.setDrawColor(5, 150, 105);
          doc.setLineWidth(0.4);
          doc.rect(margin + 1, currentY - 3.2, 3.5, 3.5);

          doc.text(itemLines, margin + 8, currentY);
          currentY += itemLines.length * 5 + 2;
        });
        currentY += 3;
      } else if (block.type === 'table' && block.tableData) {
        const { headers, rows } = block.tableData;
        const colCount = Math.max(headers.length, 1);
        const colWidth = contentWidth / colCount;

        checkNewPage(15 + rows.length * 8);

        // Header
        doc.setFillColor(230, 244, 234);
        doc.rect(margin, currentY, contentWidth, 7, 'F');
        doc.setDrawColor(180, 205, 190);
        doc.rect(margin, currentY, contentWidth, 7, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(6, 95, 70);

        headers.forEach((h, colIdx) => {
          const x = margin + colIdx * colWidth + 2;
          doc.text(h, x, currentY + 5);
        });
        currentY += 7;

        // Rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(31, 41, 55);

        rows.forEach((row) => {
          checkNewPage(8);
          doc.setDrawColor(220, 230, 225);
          doc.rect(margin, currentY, contentWidth, 7, 'S');

          row.forEach((cell, cIdx) => {
            const x = margin + cIdx * colWidth + 2;
            const textFit = doc.splitTextToSize(cell, colWidth - 4)[0] || '';
            doc.text(textFit, x, currentY + 5);
          });
          currentY += 7;
        });
        currentY += 4;
      } else if (block.type === 'worksheet') {
        const isAnswerPrompt = block.content.toLowerCase().includes('jawaban') || block.content.toLowerCase().includes('tuliskan');
        const lines = doc.splitTextToSize(block.content, contentWidth);
        checkNewPage(lines.length * 5.5 + (isAnswerPrompt ? 14 : 6));

        doc.setFont('helvetica', isAnswerPrompt ? 'bold' : 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(31, 41, 55);
        doc.text(lines, margin, currentY);
        currentY += lines.length * 5.5 + 3;

        // If it's an answer area, draw blank lines for writing
        if (isAnswerPrompt) {
          doc.setDrawColor(209, 213, 219);
          doc.setLineWidth(0.3);
          doc.line(margin, currentY + 4, margin + contentWidth, currentY + 4);
          doc.line(margin, currentY + 11, margin + contentWidth, currentY + 11);
          currentY += 16;
        }
      } else if (block.type === 'bullet' && block.items) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(31, 41, 55);

        block.items.forEach((it) => {
          const itemLines = doc.splitTextToSize(it, contentWidth - 8);
          checkNewPage(itemLines.length * 5 + 3);
          doc.text('•', margin + 1, currentY);
          doc.text(itemLines, margin + 6, currentY);
          currentY += itemLines.length * 5 + 2;
        });
        currentY += 3;
      } else {
        // Regular paragraph
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(31, 41, 55);
        const pLines = doc.splitTextToSize(block.content, contentWidth);
        checkNewPage(pLines.length * 5 + 4);
        doc.text(pLines, margin, currentY);
        currentY += pLines.length * 5 + 4;
      }
    });
  });

  // 7. PENUTUP & KESIMPULAN
  if (project.conclusion) {
    doc.addPage();
    currentY = margin + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(6, 95, 70);
    doc.text('PENUTUP & LANGKAH SELANJUTNYA', margin, currentY);
    currentY += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);

    const conclParagraphs = project.conclusion.split('\n\n');
    conclParagraphs.forEach((para) => {
      const pLines = doc.splitTextToSize(para.trim(), contentWidth);
      checkNewPage(pLines.length * 5.5 + 6);
      doc.text(pLines, margin, currentY);
      currentY += pLines.length * 5.5 + 5;
    });
  }

  // 8. ADD PAGE NUMBERS & SUBTLE HEADER (Skip cover page if present)
  const totalPages = doc.getNumberOfPages();
  const startPageNum = project.coverImage ? 2 : 1;

  for (let i = startPageNum; i <= totalPages; i++) {
    doc.setPage(i);

    // Subtle header line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(project.title, margin, 12);
    doc.text(brandName, pageWidth - margin, 12, { align: 'right' });
    doc.setDrawColor(243, 244, 246);
    doc.setLineWidth(0.2);
    doc.line(margin, 14, pageWidth - margin, 14);

    // Footer page number
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  return doc.output('blob');
}

export function downloadPdfBlob(blob: Blob, title: string): void {
  const filename = `${slugify(title || 'produk-digital')}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
