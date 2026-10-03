import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Robust JSON extraction from LLM response (handles markdown blocks, raw json, etc.)
function parseJsonSafely<T = any>(rawText: string, fallback: T): T {
  if (!rawText) return fallback;
  let text = rawText.trim();

  // Strip markdown code fences if wrapped in ```json ... ```
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // Try to find the outermost JSON array or object
    const firstBracket = text.indexOf("[");
    const lastBracket = text.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1)) as T;
      } catch {}
    }

    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1)) as T;
      } catch {}
    }

    return fallback;
  }
}

// Models prioritized by availability and speed (gemini-3.1-flash-lite and gemini-3.6-flash avoid 503 high-demand blocks)
const FALLBACK_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
];

async function generateWithFallback(params: {
  contents: string;
  config?: any;
}) {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Engine] Model ${model} attempt ${attempt + 1} failed:`, err?.message || err);
        // If it's a 503, 429, or network hiccup, wait a moment then try next or retry
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
  }

  throw lastError || new Error("Semua model AI sedang sibuk. Silakan coba beberapa saat lagi.");
}

const CORE_SYSTEM_INSTRUCTION = `Anda adalah penulis profesional, instructional content designer, dan editor produk digital terkemuka untuk pasar Indonesia.
Tugas Anda bukan sekadar menghasilkan tulisan panjang. Tugas Anda menghasilkan produk digital (Ebook atau Workbook) yang:
- Jelas, terstruktur, praktis, dan memiliki nilai guna tinggi
- Mudah dipahami sesuai target pembaca dan tujuan produk
- Mengalir natural dibaca (Natural Indonesian Writing) dan tidak repetitif
- Mengutamakan implementasi nyata, langkah aksi terukur, dan contoh ilustratif dibanding filler teoretis
- FACTUAL SAFETY: DILARANG mengarang statistik, penelitian fiktif, angka investasi, pendapatan pasti, atau kutipan ahli palsu. Jika contoh adalah karangan, sebutkan eksplisit "Contoh ilustratif".
- HINDARI KLISE: Jangan gunakan pembukaan generik seperti "Di era digital yang semakin berkembang...", "Seiring perkembangan zaman...", "Pada era modern saat ini...", atau motivasi kosong.
- Gunakan bahasa yang nyaman dibaca di layar HP (paragraf ringkas 2-4 kalimat). Hindari "gue/lo" kecuali diminta secara spesifik.`;

// 1. IMPROVE TITLE API
app.post("/api/ai/improve-title", async (req, res) => {
  try {
    const { title, productType, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const prompt = `Pengguna ingin membuat produk digital (${productType === "workbook" ? "Workbook / Lembar Kerja Praktis" : "Ebook Panduan Praktis"}).
Judul awal saat ini: "${title}"
${description ? `Konteks/Deskripsi awal: "${description}"` : ""}

Berikan MAKSIMAL 3 alternatif judul yang:
1. Lebih memikat, spesifik, dan bernilai jual ("Ide tulisan jadi uang")
2. Relevan dengan produk digital praktis untuk pasar Indonesia
3. Tidak berlebihan/clickbait murahan, tetap kredibel dan jelas

Format respon WAJIB berupa JSON array string sederhana berisi tepat 3 judul alternatif:
["Alternatif Judul 1", "Alternatif Judul 2", "Alternatif Judul 3"]
Kirim HANYA JSON array tersebut tanpa teks markdown pengantar atau penutup.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: CORE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const fallbackTitles = [
      `${title}: Panduan Praktis Siap Pakai`,
      `Strategi Praktis: ${title}`,
      `Langkah Nyata ${title}`,
    ];

    const titles = parseJsonSafely<string[]>(response.text?.trim() || "", fallbackTitles);
    return res.json({ titles: titles.slice(0, 3) });
  } catch (error: any) {
    console.error("Error improving title:", error);
    return res.status(500).json({ error: error.message || "Gagal memperbaiki judul" });
  }
});

// 2. POLISH DESCRIPTION API
app.post("/api/ai/polish-description", async (req, res) => {
  try {
    const { description, title, productType } = req.body;
    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    const prompt = `Pengguna sedang menyusun produk digital (${productType === "workbook" ? "Workbook" : "Ebook"}).
Judul: "${title || "Tanpa Judul"}"
Deskripsi pengguna saat ini:
"${description}"

Tugas Anda: Rapikan deskripsi di atas agar lebih tajam, terstruktur, dan jelas bagi calon pembaca, TANPA mengubah inti atau pesan aslinya.
- Pertahankan sudut pandang dan ide dasar
- Buat dalam 2-4 kalimat yang padat dan menarik
- Gunakan bahasa Indonesia natural
Kirim HANYA teks deskripsi yang sudah dirapikan tanpa tanda petik pembuka/penutup atau penjelasan tambahan.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: CORE_SYSTEM_INSTRUCTION,
      },
    });

    return res.json({ polished: response.text?.trim() || description });
  } catch (error: any) {
    console.error("Error polishing description:", error);
    return res.status(500).json({ error: error.message || "Gagal merapikan deskripsi" });
  }
});

// 3. GENERATE OUTLINE API
app.post("/api/ai/generate-outline", async (req, res) => {
  try {
    const {
      productType,
      title,
      description,
      author,
      brand,
      targetAudience,
      readerGoal,
      readerLevel,
      chapterCountChoice,
      customChapterCount,
    } = req.body;

    let targetCount = 5;
    if (chapterCountChoice === "5") targetCount = 5;
    else if (chapterCountChoice === "7") targetCount = 7;
    else if (chapterCountChoice === "10") targetCount = 10;
    else if (chapterCountChoice === "custom" && customChapterCount) targetCount = Math.min(Math.max(customChapterCount, 3), 15);
    else if (chapterCountChoice === "ai") targetCount = 7; // Default baseline if AI decides

    const isWorkbook = productType === "workbook";

    const prompt = `Susunlah outline bab terstruktur untuk sebuah ${isWorkbook ? "WORKBOOK (Lembar Kerja & Action Plan Praktis)" : "EBOOK (Panduan Digital Terstruktur)"}.

Konteks Produk:
- Judul: ${title || "Panduan Praktis"}
- Deskripsi: ${description || "Panduan aplikatif"}
- Penulis / Brand: ${author || "Anonim"} (${brand || "WIC"})
- Target Pembaca: ${targetAudience || "Umum"}
- Tujuan Produk: ${readerGoal || "Memahami dan mempraktikkan materi"}
- Tingkat Pembaca: ${readerLevel || "Semua Tingkat"}
- Target Jumlah Bab: ${chapterCountChoice === "ai" ? "Tentukan jumlah bab terbaik (antara 5 sampai 8 bab)" : `${targetCount} bab`}

Aturan Khusus:
1. Alur bab harus runtut secara pedagogis: dari fondasi/orientasi, eksplorasi konsep, langkah implementasi bertahap, studi kasus/contoh, hingga rencana aksi/review.
2. Setiap bab memiliki "title" yang menarik & ringkas, serta "goal" yang menjelaskan tujuan spesifik yang dicapai pembaca setelah menyelesaikan bab tersebut.
3. ${isWorkbook ? "Karena ini WORKBOOK, setiap bab wajib dirancang sebagai modul latihan, evaluasi, checklist, atau lembar aksi praktis." : "Karena ini EBOOK, setiap bab harus praktis, actionable, dan enak dibaca tanpa teori bertele-tele."}

Respon WAJIB berupa JSON array dengan struktur tepat:
[
  {
    "number": 1,
    "title": "Judul Bab",
    "goal": "Tujuan bab yang spesifik dan berorientasi hasil"
  }
]
Kirim HANYA JSON array tanpa teks pembuka atau penutup.`;

    let outline: any[] = [];
    try {
      const response = await generateWithFallback({
        contents: prompt,
        config: {
          systemInstruction: CORE_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
        },
      });

      outline = parseJsonSafely<any[]>(response.text?.trim() || "", []);
    } catch (aiErr: any) {
      console.warn("AI generation of outline had an issue, preparing smart fallback outline:", aiErr?.message);
    }

    // If AI couldn't provide a valid array, generate high-quality deterministic outline
    if (!Array.isArray(outline) || outline.length === 0) {
      const defaultGoals = [
        "Membangun pemahaman fondasi dan mindset penting sebelum memulai.",
        "Mengidentifikasi kebutuhan inti, peluang, dan memetakan langkah awal.",
        "Mengeksekusi strategi utama secara terstruktur dan terukur.",
        "Mengoptimalkan proses dan mengatasi kendala umum yang sering muncul.",
        "Menyusun evaluasi dan rencana aksi nyata berkelanjutan.",
        "Mendalami studi kasus konkret dan implementasi lanjutan.",
        "Membangun sistem dan otomatisasi untuk hasil jangka panjang.",
        "Mengukur pencapaian dan menyiapkan langkah pertumbuhan berikutnya.",
        "Praktik pemecahan masalah dan strategi eskalasi hasil.",
        "Panduan checklist akhir dan eksekusi komersial.",
      ];

      const defaultTitles = [
        `Fondasi & Pola Pikir: Mengawali ${title || "Proyek Anda"}`,
        `Identifikasi & Riset: Memetakan Peluang Nyata`,
        `Langkah Aksi: Eksekusi Strategi Tahap Demi Tahap`,
        `Optimalisasi & Trik Mengatasi Kendala Lapangan`,
        `Rencana Implementasi Nyata & Review Hasil`,
        `Studi Kasus & Analisis Keberhasilan`,
        `Membangun Konsistensi & Pertumbuhan Berkelanjutan`,
        `Pengembangan Lanjutan & Monetisasi`,
        `Troubleshooting: Menghindari Kesalahan Fatal`,
        `Checklist Akhir & Peluncuran Produk`,
      ];

      outline = [];
      for (let i = 0; i < targetCount; i++) {
        outline.push({
          number: i + 1,
          title: defaultTitles[i] || `Bab ${i + 1}: Implementasi Lanjutan`,
          goal: defaultGoals[i] || "Memperkuat hasil dan eksekusi pembaca.",
        });
      }
    }

    // Ensure sequential numbers and valid structure
    outline = outline.map((item: any, idx: number) => ({
      number: idx + 1,
      title: item.title || `Bab ${idx + 1}`,
      goal: item.goal || "Membantu pembaca memahami dan mempraktikkan topik ini.",
    }));

    return res.json({ outline });
  } catch (error: any) {
    console.error("Error generating outline:", error);
    return res.status(500).json({ error: error.message || "Gagal menyusun outline" });
  }
});

// 4. REGENERATE SINGLE CHAPTER OUTLINE
app.post("/api/ai/regenerate-chapter-outline", async (req, res) => {
  try {
    const { chapterNumber, currentChapter, masterContext } = req.body;
    const isWorkbook = masterContext.productType === "workbook";

    const prompt = `Pengguna ingin merombak/meregenerasi Bab ${chapterNumber} dari outline produknya.
Konteks Keseluruhan Produk:
- Judul: ${masterContext.title}
- Deskripsi: ${masterContext.description}
- Target Pembaca: ${masterContext.targetAudience}
- Tujuan Produk: ${masterContext.readerGoal}
- Format: ${isWorkbook ? "Workbook" : "Ebook"}
- Bab yang ingin diregenerasi: Bab ${chapterNumber} (saat ini: "${currentChapter.title}")
- Outline bab lainnya: ${JSON.stringify(masterContext.outline)}

Buatlah 1 judul bab baru dan tujuan bab baru yang selaras dengan bab sebelum dan sesudahnya.
Respon WAJIB berupa JSON objek:
{
  "title": "Judul Bab Baru",
  "goal": "Tujuan bab baru"
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: CORE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const parsed = parseJsonSafely<{ title?: string; goal?: string }>(response.text?.trim() || "", {});
    return res.json({
      title: parsed.title || currentChapter.title,
      goal: parsed.goal || currentChapter.goal,
    });
  } catch (error: any) {
    console.error("Error regenerating chapter outline:", error);
    return res.status(500).json({ error: error.message || "Gagal meregenerasi bab outline" });
  }
});

// 5. SEQUENTIAL CHAPTER WRITER API
app.post("/api/ai/generate-chapter", async (req, res) => {
  try {
    const { masterContext, chapterIndex } = req.body;
    const currentChapter = masterContext.outline[chapterIndex];
    if (!currentChapter) {
      return res.status(400).json({ error: "Invalid chapter index" });
    }

    const isWorkbook = masterContext.productType === "workbook";
    const previousSummaries = masterContext.previousChapterSummaries || [];

    const prompt = `Anda sedang menulis isi lengkap untuk Bab ${currentChapter.number}: "${currentChapter.title}".
Tujuan Bab: ${currentChapter.goal}

=== MASTER PRODUCT CONTEXT ===
- Jenis Produk: ${isWorkbook ? "WORKBOOK (Buku Kerja Praktis Berisi Latihan & Tindakan Nyata)" : "EBOOK (Panduan Digital Terstruktur)"}
- Judul Buku: ${masterContext.title}
- Deskripsi: ${masterContext.description}
- Penulis: ${masterContext.author || "Penulis"} (${masterContext.brand || "WIC"})
- Target Pembaca: ${masterContext.targetAudience}
- Tujuan Buku: ${masterContext.readerGoal}
- Level Pembaca: ${masterContext.readerLevel}
- Gaya Tulisan: ${masterContext.writingStyle} ${masterContext.customStyle ? `(${masterContext.customStyle})` : ""}
- Karakter Penulis: ${masterContext.writerCharacter}
- Banyak Contoh Praktis: ${masterContext.hasManyExamples ? "YA (Wajib sertakan contoh konkret/ilustratif)" : "Secukupnya"}
- Natural Writing Engine: ${masterContext.isNaturalWriting ? "AKTIF (Gunakan bahasa Indonesia hidup, variatif, hindari kalimat kaku/template AI)" : "Standar"}
- Hindari AI Generik: ${masterContext.avoidGenericAi ? "AKTIF (DILARANG pakai 'Di era digital saat ini...', 'Seiring berjalannya waktu...', dsb.)" : "Standar"}

=== OUTLINE LENGKAP BUKU ===
${masterContext.outline.map((ch: any) => `Bab ${ch.number}: ${ch.title} — ${ch.goal}`).join("\n")}

=== RINGKASAN BAB SEBELUMNYA (KONSISTENSI & KESINAMBUNGAN) ===
${previousSummaries.length > 0 ? previousSummaries.map((s: string, i: number) => `Bab ${i + 1}: ${s}`).join("\n") : "Ini adalah bab pertama."}

=== ATURAN FORMAT & PENULISAN WAJIB ===
1. DUPLICATE HEADING PREVENTION: DILARANG mengulang "Bab ${currentChapter.number}: ${currentChapter.title}" atau judul bab di awal teks. Langsung mulai dengan paragraf pembuka bab.
2. STRUKTUR BAB:
${
  isWorkbook
    ? `KARENA INI WORKBOOK:
- BUKAN ARTIKEL ATAU EBOOK BIASA!
- Prioritaskan instruksi ringkas, lembar pertanyaan refleksi, tabel assessment, checklist □, latihan aplikatif, dan tempat menulis jawaban pembaca:
  Contoh:
  Tuliskan 3 tantangan terbesar Anda:
  1. __________________________________________________
  2. __________________________________________________
  3. __________________________________________________
- Gunakan checklist berformat:
  □ Item checklist 1
  □ Item checklist 2
- Sertakan bagian LANGKAH AKSI NYATA dan LEMBAR EVALUASI DIRI.`
    : `KARENA INI EBOOK:
- Tuliskan isi bab secara mendalam, terstruktur, dan kaya wawasan praktis (minimal 400 - 800 kata).
- Gunakan sub-heading (format: "### Nama Sub-Bab") untuk memecah poin utama.
- Sematkan Callout Blocks secara natural dengan sintaks penanda:
  [TIPS] ... [/TIPS]
  [CATATAN] ... [/CATATAN]
  [PERHATIAN] ... [/PERHATIAN]
  [CONTOH] ... [/CONTOH]
  [LANGKAH AKSI] ... [/LANGKAH AKSI]
- Jika relevan, sertakan Tabel perbandingan/framework ringkas dengan format Markdown (| Kolom 1 | Kolom 2 |).
- Di akhir bab, SELALU tutup dengan:
  [POIN KUNCI BAB INI]
  - Poin ringkasan 1
  - Poin ringkasan 2
  [/POIN KUNCI BAB INI]`
}
3. FACTUAL SAFETY: Jangan mengarang studi ilmiah atau angka fiktif. Jika ada studi kasus ilustratif, tandai sebagai "Contoh ilustratif".

Format Keluaran:
Kirimkan JSON dengan dua properti:
{
  "content": "Isi lengkap bab sesuai instruksi di atas...",
  "summary": "Ringkasan 1-2 kalimat mengenai esensi yang dipelajari atau diselesaikan pembaca di bab ini (untuk menjaga kesinambungan bab berikutnya)."
}
Kirim HANYA format JSON di atas.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: CORE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const parsed = parseJsonSafely<{ content?: string; summary?: string }>(
      response.text?.trim() || "",
      {}
    );

    let content = parsed.content || "";
    let summary = parsed.summary || "";

    // If content is empty (e.g. model output was plain text instead of json)
    if (!content && response.text) {
      content = response.text.trim();
      summary = `Bab ${currentChapter.number} membahas materi ${currentChapter.title} secara praktis.`;
    }

    return res.json({
      chapterNumber: currentChapter.number,
      title: currentChapter.title,
      content,
      summary,
    });
  } catch (error: any) {
    console.error("Error generating chapter:", error);
    return res.status(500).json({ error: error.message || "Gagal membuat konten bab" });
  }
});

// 6. REWRITE CHAPTER CONTENT API
app.post("/api/ai/rewrite-chapter", async (req, res) => {
  try {
    const { content, instruction, customInstruction, masterContext, chapterTitle } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    let instructionText = "";
    switch (instruction) {
      case "more_natural":
        instructionText = "Tulis ulang agar terdengar jauh lebih natural, luwes, santai namun tetap berbobot, tanpa kalimat template AI kaku.";
        break;
      case "more_concise":
        instructionText = "Buat tulisan lebih ringkas, padat, to the point, dan pangkas kalimat berbunga tanpa menghilangkan poin inti.";
        break;
      case "more_clear":
        instructionText = "Tingkatkan kejelasan penjelasan, gunakan kalimat terstruktur yang lebih mudah dipahami bahkan oleh pembaca awam.";
        break;
      case "more_examples":
        instructionText = "Perkaya tulisan dengan contoh-contoh praktis, ilustrasi kasus nyata/konkret, dan langkah aplikatif.";
        break;
      case "custom":
        instructionText = customInstruction || "Perbaiki dan tingkatkan kualitas tulisan ini.";
        break;
      default:
        instructionText = "Tingkatkan keterbacaan dan kualitas tulisan.";
    }

    const prompt = `Anda adalah editor buku ahli.
Konteks Produk:
- Judul: ${masterContext?.title || "Produk Digital"}
- Bab: ${chapterTitle || "Bab"}
- Gaya Tulisan: ${masterContext?.writingStyle || "Akrab & Hangat"}

Tugas Editor:
${instructionText}

Peraturan Penting:
- Jangan tambahkan judul bab di baris awal.
- Pertahankan format callout blocks seperti [TIPS]...[/TIPS], [CATATAN], [CONTOH], [LANGKAH AKSI], checklist □, atau tabel jika ada.
- Jangan mengarang fakta palsu atau statistik fiktif.

Teks saat ini yang perlu diperbaiki:
"""
${content}
"""

Kirimkan HANYA hasil tulisan bab yang sudah diperbaiki, tanpa kata pengantar atau catatan penutup dari editor.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: CORE_SYSTEM_INSTRUCTION,
      },
    });

    return res.json({ rewritten: response.text?.trim() || content });
  } catch (error: any) {
    console.error("Error rewriting chapter:", error);
    return res.status(500).json({ error: error.message || "Gagal memperbaiki tulisan" });
  }
});

// 7. GENERATE INTRODUCTION & CONCLUSION API
app.post("/api/ai/generate-book-ends", async (req, res) => {
  try {
    const { masterContext } = req.body;
    const isWorkbook = masterContext.productType === "workbook";

    const prompt = `Buatkan PENDAHULUAN (Introduction) dan KESIMPULAN/PENUTUP (Conclusion & Next Steps) untuk ${isWorkbook ? "Workbook" : "Ebook"} berikut:
Judul: ${masterContext.title}
Deskripsi: ${masterContext.description}
Penulis: ${masterContext.author || "Penulis"}
Brand: ${masterContext.brand || "WIC"}
Target Pembaca: ${masterContext.targetAudience}
Tujuan: ${masterContext.readerGoal}
Gaya Tulisan: ${masterContext.writingStyle} (${masterContext.writerCharacter})
Daftar Bab:
${masterContext.outline.map((c: any) => `- Bab ${c.number}: ${c.title}`).join("\n")}

Format Keluaran JSON:
{
  "introduction": "Teks pendahuluan 3-4 paragraf yang hangat, memotivasi tanpa klise, menjelaskan mengapa buku ini dibuat dan bagaimana cara terbaik menggunakannya...",
  "conclusion": "Teks kesimpulan & langkah berikutnya yang inspiratif dan berorientasi tindakan nyata (action plan), merangkum perjalanan pembaca..."
}
Kirim HANYA format JSON di atas.`;

    let result = { introduction: "", conclusion: "" };
    try {
      const response = await generateWithFallback({
        contents: prompt,
        config: {
          systemInstruction: CORE_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
        },
      });

      const parsed = parseJsonSafely<{ introduction?: string; conclusion?: string }>(
        response.text?.trim() || "",
        {}
      );
      if (parsed.introduction) result.introduction = parsed.introduction;
      if (parsed.conclusion) result.conclusion = parsed.conclusion;
    } catch (aiErr: any) {
      console.warn("AI generation for book ends failed, using default template:", aiErr?.message);
    }

    if (!result.introduction) {
      result.introduction = `Selamat datang di ${masterContext.title || "panduan ini"}.\n\nBuku ini disusun secara khusus untuk membantu Anda memahami dan menerapkan langkah-langkah praktis secara sistematis. Manfaatkan setiap bab sebagai pijakan untuk mengambil tindakan nyata.`;
    }
    if (!result.conclusion) {
      result.conclusion = `Selamat! Anda telah menyelesaikan seluruh rangkaian materi dalam buku ini.\n\nPengetahuan hanya akan bernilai jika diwujudkan menjadi tindakan. Mulailah dari langkah terkecil hari ini dan bangun konsistensi Anda secara berkelanjutan.`;
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Error generating book ends:", error);
    return res.status(500).json({ error: error.message || "Gagal membuat pendahuluan & penutup" });
  }
});

// 8. GENERATE UNIVERSAL COVER PROMPT API
app.post("/api/ai/generate-cover-prompt", async (req, res) => {
  try {
    const { masterContext } = req.body;

    const prompt = `Sebagai creative art director dan desainer sampul buku digital profesional, buatkan "Universal Cover Image Prompt" dalam bahasa Inggris untuk sampul produk digital ini:
- Judul: ${masterContext.title}
- Jenis: ${masterContext.productType === "workbook" ? "Workbook / Interactive Action Guide" : "Practical Modern Ebook Guide"}
- Target Audiens: ${masterContext.targetAudience}
- Tema & Mood: Modern, professional, clean typography space, high aesthetic value, corporate/creator tone, minimalist luxury. Warna dominan selaras dengan emerald green / dark forest green, charcoal black, and crisp white accents.

Buat 1 prompt visual universal yang optimal untuk digunakan di Midjourney, ChatGPT/DALL-E 3, Gemini, Flux, atau image generator lainnya.
Format prompt:
- Deskripsi visual adegan / objek / layout sampul buku
- Penempatan ruang kosong untuk judul (negative space for typography)
- Gaya estetika, pencahayaan studio, resolusi tinggi (8k, minimal clean, elegant composition)
- Aspect ratio 1:1 atau 3:4 portrait untuk buku

Kirimkan HANYA prompt teks bahasa Inggris yang siap di-copy oleh pengguna.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: "You are an expert commercial book cover designer and AI prompt engineer.",
      },
    });

    return res.json({ prompt: response.text?.trim() || "" });
  } catch (error: any) {
    console.error("Error generating cover prompt:", error);
    return res.status(500).json({ error: error.message || "Gagal membuat prompt cover" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Vite middleware in dev or static files in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WIC Ebook Generator server running on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
});
