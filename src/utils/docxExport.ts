import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  PageBreak,
} from 'docx';
import { Project } from '../types';
import { cleanDuplicateHeading, parseContentBlocks } from './contentParser';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Convert base64 data URL to Uint8Array for docx ImageRun
function base64ToUint8Array(base64Data: string): Uint8Array {
  const parts = base64Data.split(',');
  const raw = parts.length > 1 ? parts[1] : parts[0];
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function exportToDocx(project: Project): Promise<Blob> {
  const isWorkbook = project.productType === 'workbook';
  const year = new Date().getFullYear();
  const authorName = project.author || 'Penulis';
  const brandName = project.brand || 'Worth It Circle';

  const docChildren: any[] = [];

  // 1. COVER PAGE (If user uploaded an image)
  if (project.coverImage) {
    try {
      const imgBytes = base64ToUint8Array(project.coverImage);
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
          children: [
            new ImageRun({
              data: imgBytes,
              transformation: {
                width: 520,
                height: 680,
              },
            } as any),
          ],
        }),
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    } catch (e) {
      console.warn('Cover image conversion for docx failed, skipping image page', e);
    }
  }

  // 2. TITLE PAGE
  docChildren.push(
    new Paragraph({
      spacing: { before: 2000, after: 300 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: isWorkbook ? 'WORKBOOK & ACTION GUIDE' : 'PANDUAN PRAKTIS PRODUK DIGITAL',
          size: 24, // 12pt
          color: '065F46', // emerald 800
          bold: true,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 200, after: 600 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: project.title,
          size: 48, // 24pt
          bold: true,
          color: '111827',
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 1200 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: project.description,
          size: 24,
          color: '4B5563',
          italics: true,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 1800, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Ditulis oleh: ${authorName}`,
          size: 26,
          bold: true,
          color: '1F2937',
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 400 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: brandName,
          size: 22,
          color: '047857',
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // 3. COPYRIGHT & DISCLAIMER PAGE
  docChildren.push(
    new Paragraph({
      spacing: { before: 2000, after: 400 },
      children: [
        new TextRun({
          text: 'HAK CIPTA & KETENTUAN',
          size: 28,
          bold: true,
          color: '111827',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: `Hak Cipta © ${year} oleh ${authorName}.`,
          size: 22,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 300 },
      children: [
        new TextRun({
          text: `Diterbitkan secara digital oleh ${brandName}. Seluruh hak cipta dilindungi undang-undang. Tidak ada bagian dari buku/lembar kerja ini yang boleh digandakan, disebarluaskan, atau dialihkan dalam bentuk apa pun tanpa izin tertulis dari pemegang hak cipta, kecuali kutipan singkat untuk keperluan ulasan.`,
          size: 20,
          color: '4B5563',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'DISCLAIMER (SANGGAHAN)',
          size: 24,
          bold: true,
          color: '374151',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 400 },
      children: [
        new TextRun({
          text: `Buku ini dibuat untuk tujuan edukasi dan panduan praktis. Hasil yang dicapai oleh masing-masing pembaca dapat bervariasi bergantung pada dedikasi, usaha, dan kondisi pasar masing-masing. Penulis dan penerbit tidak menjamin pendapatan atau hasil keuangan tertentu. Setiap contoh yang disajikan dalam buku ini merupakan ilustrasi praktis untuk mempermudah pemahaman.`,
          size: 20,
          color: '4B5563',
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // 4. DAFTAR ISI (TABLE OF CONTENTS - STATIC)
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 400 },
      children: [
        new TextRun({
          text: 'DAFTAR ISI',
          size: 32,
          bold: true,
          color: '065F46',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 200 },
      children: [
        new TextRun({
          text: '• Pendahuluan',
          size: 24,
          bold: true,
        }),
      ],
    })
  );

  project.outline.forEach((ch) => {
    docChildren.push(
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: `• Bab ${ch.number}: ${ch.title}`,
            size: 24,
          }),
        ],
      })
    );
  });

  docChildren.push(
    new Paragraph({
      spacing: { before: 100, after: 400 },
      children: [
        new TextRun({
          text: '• Penutup & Langkah Selanjutnya',
          size: 24,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // 5. PENDAHULUAN
  if (project.introduction) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 300 },
        children: [
          new TextRun({
            text: 'PENDAHULUAN',
            size: 36,
            bold: true,
            color: '065F46',
          }),
        ],
      }),
      ...project.introduction.split('\n\n').map(
        (para) =>
          new Paragraph({
            spacing: { before: 150, after: 150, line: 360 },
            children: [
              new TextRun({
                text: para.trim(),
                size: 22,
                font: 'Calibri',
              }),
            ],
          })
      ),
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // 6. CHAPTERS
  project.chapters.forEach((chapter) => {
    // Chapter Divider Page
    docChildren.push(
      new Paragraph({
        spacing: { before: 3000, after: 200 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: `BAB ${chapter.number.toString().padStart(2, '0')}`,
            size: 28,
            bold: true,
            color: '047857',
            font: 'Calibri',
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 600 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: chapter.title,
            size: 42,
            bold: true,
            color: '111827',
            font: 'Calibri',
          }),
        ],
      }),
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    // Chapter Content Header
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 },
        children: [
          new TextRun({
            text: `Bab ${chapter.number}: ${chapter.title}`,
            size: 32,
            bold: true,
            color: '065F46',
            font: 'Calibri',
          }),
        ],
      })
    );

    const cleanedContent = cleanDuplicateHeading(chapter.content, chapter.title, chapter.number);
    const blocks = parseContentBlocks(cleanedContent);

    blocks.forEach((block) => {
      if (block.type === 'heading2') {
        docChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: block.content,
                size: 26,
                bold: true,
                color: '1F2937',
              }),
            ],
          })
        );
      } else if (block.type === 'heading3') {
        docChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 250, after: 120 },
            children: [
              new TextRun({
                text: block.content,
                size: 24,
                bold: true,
                color: '374151',
              }),
            ],
          })
        );
      } else if (block.type === 'callout') {
        // Callout box rendered as a single cell table with thick left border
        const borderColor =
          block.calloutType === 'perhatian'
            ? 'D97706' // amber
            : block.calloutType === 'contoh'
            ? '4F46E5' // indigo
            : '059669'; // emerald

        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F0FDF4' },
                    margins: { top: 180, bottom: 180, left: 240, right: 240 },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      left: { style: BorderStyle.SINGLE, size: 24, color: borderColor },
                    },
                    children: [
                      new Paragraph({
                        spacing: { before: 50, after: 100 },
                        children: [
                          new TextRun({
                            text: `[ ${block.title} ]`,
                            size: 22,
                            bold: true,
                            color: borderColor,
                          }),
                        ],
                      }),
                      ...block.content.split('\n').map(
                        (line) =>
                          new Paragraph({
                            spacing: { before: 50, after: 50 },
                            children: [
                              new TextRun({
                                text: line,
                                size: 20,
                                color: '1F2937',
                              }),
                            ],
                          })
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 100, after: 100 }, children: [] })
        );
      } else if (block.type === 'checklist' && block.items) {
        block.items.forEach((item) => {
          docChildren.push(
            new Paragraph({
              spacing: { before: 80, after: 80 },
              children: [
                new TextRun({
                  text: '□  ',
                  size: 22,
                  bold: true,
                  color: '047857',
                }),
                new TextRun({
                  text: item,
                  size: 22,
                  color: '1F2937',
                }),
              ],
            })
          );
        });
      } else if (block.type === 'table' && block.tableData) {
        const headers = block.tableData.headers;
        const rows = block.tableData.rows;

        const tableRows = [
          new TableRow({
            tableHeader: true,
            children: headers.map(
              (h) =>
                new TableCell({
                  shading: { fill: 'E6F4EA' },
                  margins: { top: 120, bottom: 120, left: 150, right: 150 },
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: h, bold: true, size: 20, color: '065F46' })],
                    }),
                  ],
                })
            ),
          }),
          ...rows.map(
            (r) =>
              new TableRow({
                children: r.map(
                  (c) =>
                    new TableCell({
                      margins: { top: 100, bottom: 100, left: 150, right: 150 },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: c, size: 20, color: '1F2937' })],
                        }),
                      ],
                    })
                ),
              })
          ),
        ];

        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),
          new Paragraph({ spacing: { before: 100, after: 100 }, children: [] })
        );
      } else if (block.type === 'bullet' && block.items) {
        block.items.forEach((it) => {
          docChildren.push(
            new Paragraph({
              spacing: { before: 80, after: 80 },
              bullet: { level: 0 },
              children: [
                new TextRun({
                  text: it,
                  size: 22,
                  color: '1F2937',
                }),
              ],
            })
          );
        });
      } else if (block.type === 'worksheet') {
        docChildren.push(
          new Paragraph({
            spacing: { before: 150, after: 150 },
            children: [
              new TextRun({
                text: block.content,
                size: 22,
                color: '374151',
                bold: block.content.toLowerCase().includes('jawaban') || block.content.toLowerCase().includes('tuliskan'),
              }),
            ],
          })
        );
      } else {
        // Regular paragraph
        docChildren.push(
          new Paragraph({
            spacing: { before: 120, after: 120, line: 360 },
            children: [
              new TextRun({
                text: block.content,
                size: 22,
                font: 'Calibri',
                color: '1F2937',
              }),
            ],
          })
        );
      }
    });

    // Page break after chapter
    docChildren.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  });

  // 7. PENUTUP & LANGKAH SELANJUTNYA
  if (project.conclusion) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 300 },
        children: [
          new TextRun({
            text: 'PENUTUP & LANGKAH SELANJUTNYA',
            size: 34,
            bold: true,
            color: '065F46',
          }),
        ],
      }),
      ...project.conclusion.split('\n\n').map(
        (para) =>
          new Paragraph({
            spacing: { before: 150, after: 150, line: 360 },
            children: [
              new TextRun({
                text: para.trim(),
                size: 22,
                font: 'Calibri',
              }),
            ],
          })
      )
    );
  }

  const doc = new Document({
    title: project.title,
    description: project.description,
    creator: authorName,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (1440 twips)
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadDocxBlob(blob: Blob, title: string): void {
  const filename = `${slugify(title || 'produk-digital')}.docx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
